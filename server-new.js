require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

const app = express();

// Trust proxy (important for deployment on Render behind a proxy)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('combined'));

const toOrigin = (value) => {
    const cleaned = String(value || '').trim().replace(/\/$/, '');
    if (!cleaned || cleaned.toLowerCase() === 'undefined' || cleaned.toLowerCase() === 'null') {
        return '';
    }
    if (!/^https?:\/\//i.test(cleaned)) {
        return `https://${cleaned}`;
    }
    return cleaned;
};

const parseOriginList = (value) => {
    return String(value || '')
        .split(',')
        .map((item) => toOrigin(item))
        .filter(Boolean);
};

const allowedOrigins = new Set([
    toOrigin(process.env.FRONTEND_URL),
    toOrigin(process.env.CLIENT_URL),
    ...parseOriginList(process.env.CORS_ORIGINS),
    // Production custom domains
    'https://threadstudios.live',
    'https://www.threadstudios.live',
    'https://threadstudios.in',
    'https://www.threadstudios.in',
    // Local development
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
].filter(Boolean));

const isAllowedOrigin = (origin) => {
    if (!origin) return true; // curl/postman/no Origin header
    if (allowedOrigins.has(origin)) return true;
    // Allow Vercel preview/prod domains while still reflecting the exact Origin (required for credentials)
    if (/^https:\/\/.*\.vercel\.app$/i.test(origin)) return true;
    return false;
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/threadstudioss', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'OK',
        message: 'Thread Studioss API is running',
        timestamp: new Date().toISOString()
    });
});

// Avoid noisy favicon 404s when the browser hits the API origin directly
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/users', require('./middleware/auth').authenticateToken, require('./routes/users'));
app.use('/api/admin', require('./middleware/auth').authenticateToken, require('./middleware/auth').requireAdmin, require('./routes/admin'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(error.status || 500).json({ 
        error: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 CLIENT_URL: ${process.env.CLIENT_URL || '(not set)'}`);
    console.log(`🔗 FRONTEND_URL: ${process.env.FRONTEND_URL || '(not set)'}`);
});

module.exports = app;
