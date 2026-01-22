const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../model/index').User;

// JWT Strategy for API authentication
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User.findById(payload.userId).select('-password');
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ 
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
            ]
        });

        if (user) {
            // Update Google ID if user exists but didn't have it
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
            return done(null, user);
        }

        // Create new user
        user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            isVerified: true,
            avatar: profile.photos[0]?.value,
            authProvider: 'google'
        });

        await user.save();
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}));

// GitHub OAuth Strategy (Optional - only if credentials provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
        scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Get primary email from GitHub
            const email = profile.emails?.find(email => email.primary)?.value || profile.emails?.[0]?.value;
            
            if (!email) {
                return done(new Error('No email found in GitHub profile'), false);
            }

            // Check if user already exists
            let user = await User.findOne({ 
                $or: [
                    { githubId: profile.id },
                    { email: email }
                ]
            });

            if (user) {
                // Update GitHub ID if user exists but didn't have it
                if (!user.githubId) {
                    user.githubId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }

            // Create new user
            user = new User({
                githubId: profile.id,
                name: profile.displayName || profile.username,
                email: email,
                isVerified: true,
                avatar: profile.photos?.[0]?.value,
                authProvider: 'github'
            });

            await user.save();
            done(null, user);
        } catch (error) {
            done(error, false);
        }
    }));
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-password');
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});

module.exports = passport;
