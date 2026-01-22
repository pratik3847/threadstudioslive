const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    googleId: {
        type: String,
        sparse: true
    },
    githubId: {
        type: String,
        sparse: true
    },
    avatar: String,
    authProvider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    },
    refreshToken: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },
    phone: {
        type: String,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { 
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.verificationToken;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpires;
            delete ret.refreshToken;
            delete ret.googleId;
            delete ret.githubId;
            return ret;
        }
    }
});

// Make password required only for local auth
userSchema.pre('save', function(next) {
    if (this.authProvider === 'local' && !this.password) {
        next(new Error('Password is required for local authentication'));
    }
    next();
});

// Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    shortDescription: {
        type: String,
        maxlength: [200, 'Short description cannot exceed 200 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    salePrice: {
        type: Number,
        min: [0, 'Sale price cannot be negative'],
        validate: {
            validator: function(value) {
                return !value || value < this.price;
            },
            message: 'Sale price must be less than regular price'
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['keychain', 'flowers', 'baskets', 'accessories', 'custom'],
            message: 'Category must be one of: keychain, flowers, baskets, accessories, custom'
        }
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    inStock: {
        type: Boolean,
        default: true
    },
    inventory: {
        type: Number,
        default: 1,
        min: [0, 'Inventory cannot be negative']
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    featured: {
        type: Boolean,
        default: false
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: {
            type: String,
            enum: ['cm', 'inches'],
            default: 'cm'
        }
    },
    weight: {
        value: Number,
        unit: {
            type: String,
            enum: ['g', 'kg'],
            default: 'g'
        }
    },
    materials: [String],
    careInstructions: String,
    customizationOptions: [{
        name: String,
        type: {
            type: String,
            enum: ['color', 'size', 'text', 'pattern']
        },
        options: [String],
        required: {
            type: Boolean,
            default: false
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Add indexes for better performance
productSchema.index({ category: 1, featured: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Order Schema
const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        price: Number,
        salePrice: Number,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: String,
        customization: [{
            option: String,
            value: String
        }]
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    shippingCost: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially-refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'razorpay', 'stripe', 'paypal', 'upi'],
        default: 'cod'
    },
    paymentDetails: {
        transactionId: String,
        paymentId: String,
        gateway: String
    },
    shippingAddress: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'India'
        }
    },
    billingAddress: {
        name: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },
    orderNotes: String,
    adminNotes: String,
    trackingNumber: String,
    shippingProvider: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    statusHistory: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
    if (this.isNew && !this.orderNumber) {
        this.orderNumber = 'TS' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

// Add indexes for better performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

// Cart Schema (for persistent cart storage)
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        customization: [{
            option: String,
            value: String
        }],
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Review Schema
const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        maxlength: 100
    },
    comment: {
        type: String,
        maxlength: 500
    },
    images: [String],
    isVerified: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    helpful: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Ensure one review per user per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Create models
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Review = mongoose.model('Review', reviewSchema);

module.exports = {
    User,
    Product,
    Order,
    Cart,
    Review
};