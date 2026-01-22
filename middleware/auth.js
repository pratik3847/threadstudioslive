const jwt = require('jsonwebtoken');
const { User } = require('../model/index');

// Middleware for JWT verification
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Access token required',
                code: 'NO_TOKEN' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                error: 'User not found',
                code: 'USER_NOT_FOUND' 
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({ 
                error: 'Account not verified',
                code: 'NOT_VERIFIED' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ 
                error: 'Token expired',
                code: 'TOKEN_EXPIRED' 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                error: 'Invalid token',
                code: 'INVALID_TOKEN' 
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            error: 'Authentication failed',
            code: 'AUTH_ERROR' 
        });
    }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Admin access required',
            code: 'ADMIN_REQUIRED' 
        });
    }
    next();
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.userId).select('-password');
            if (user && user.isVerified) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continue without user if token is invalid
        next();
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth
};