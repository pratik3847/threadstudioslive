const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const { User } = require('../model/index');
const { validate } = require('../utils/validation');
const { 
    userRegistrationSchema, 
    userLoginSchema 
} = require('../utils/validation');

// Generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' } // Short-lived access token
    );

    const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        { expiresIn: '7d' } // Long-lived refresh token
    );

    return { accessToken, refreshToken };
};

// Register new user
router.post('/register', validate(userRegistrationSchema), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            authProvider: 'local',
            isVerified: false // Set to true in production after email verification
        });

        await user.save();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login user
router.post('/login', validate(userLoginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Check if user registered with OAuth
        if (user.authProvider !== 'local') {
            return res.status(400).json({ 
                error: `Please login with ${user.authProvider}` 
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Update last login
        user.lastLogin = new Date();

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            },
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Refresh access token
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ 
                error: 'Refresh token required' 
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken, 
            process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
        );

        if (decoded.type !== 'refresh') {
            return res.status(403).json({ 
                error: 'Invalid token type' 
            });
        }

        // Find user and verify refresh token matches
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ 
                error: 'Invalid refresh token' 
            });
        }

        // Generate new tokens
        const tokens = generateTokens(user._id);

        // Update refresh token in database
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                error: 'Refresh token expired. Please login again.' 
            });
        }
        console.error('Refresh token error:', error);
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(
                token, 
                process.env.JWT_SECRET || 'your-secret-key'
            );
            
            // Clear refresh token from database
            await User.findByIdAndUpdate(decoded.userId, { 
                refreshToken: null 
            });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        // Even if token is invalid, return success for logout
        res.json({ message: 'Logged out successfully' });
    }
});

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`
    }),
    async (req, res) => {
        try {
            // Generate tokens
            const { accessToken, refreshToken } = generateTokens(req.user._id);

            // Save refresh token
            req.user.refreshToken = refreshToken;
            await req.user.save();

            // Redirect to frontend with tokens
            res.redirect(
                `${process.env.FRONTEND_URL}/auth/callback?` +
                `accessToken=${accessToken}&` +
                `refreshToken=${refreshToken}&` +
                `user=${encodeURIComponent(JSON.stringify({
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    avatar: req.user.avatar
                }))}`
            );
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
    }
);

// GitHub OAuth routes
router.get('/github',
    passport.authenticate('github', { 
        scope: ['user:email'],
        session: false 
    })
);

router.get('/github/callback',
    passport.authenticate('github', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`
    }),
    async (req, res) => {
        try {
            // Generate tokens
            const { accessToken, refreshToken } = generateTokens(req.user._id);

            // Save refresh token
            req.user.refreshToken = refreshToken;
            await req.user.save();

            // Redirect to frontend with tokens
            res.redirect(
                `${process.env.FRONTEND_URL}/auth/callback?` +
                `accessToken=${accessToken}&` +
                `refreshToken=${refreshToken}&` +
                `user=${encodeURIComponent(JSON.stringify({
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    avatar: req.user.avatar
                }))}`
            );
        } catch (error) {
            console.error('GitHub OAuth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
    }
);

module.exports = router;
