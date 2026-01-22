const Joi = require('joi');

// User validation schemas
const userRegistrationSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        }),
    phone: Joi.string()
        .pattern(/^\d{10}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please enter a valid 10-digit phone number'
        }),
    address: Joi.object({
        street: Joi.string().max(200).optional(),
        city: Joi.string().max(50).optional(),
        state: Joi.string().max(50).optional(),
        zipCode: Joi.string().pattern(/^\d{6}$/).optional().messages({
            'string.pattern.base': 'Please enter a valid 6-digit zip code'
        }),
        country: Joi.string().max(50).optional()
    }).optional()
});

const userLoginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

const userProfileUpdateSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .optional(),
    phone: Joi.string()
        .pattern(/^\d{10}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please enter a valid 10-digit phone number'
        }),
    address: Joi.object({
        street: Joi.string().max(200).optional(),
        city: Joi.string().max(50).optional(),
        state: Joi.string().max(50).optional(),
        zipCode: Joi.string().pattern(/^\d{6}$/).optional().messages({
            'string.pattern.base': 'Please enter a valid 6-digit zip code'
        }),
        country: Joi.string().max(50).optional()
    }).optional()
});

const passwordChangeSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Current password is required'
        }),
    newPassword: Joi.string()
        .min(6)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .required()
        .messages({
            'string.min': 'New password must be at least 6 characters',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'New password is required'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Password confirmation does not match',
            'any.required': 'Password confirmation is required'
        })
});

// Product validation schemas
const productSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Product name must be at least 2 characters',
            'string.max': 'Product name cannot exceed 100 characters',
            'any.required': 'Product name is required'
        }),
    description: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 1000 characters',
            'any.required': 'Product description is required'
        }),
    shortDescription: Joi.string()
        .max(200)
        .optional()
        .messages({
            'string.max': 'Short description cannot exceed 200 characters'
        }),
    price: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            'number.positive': 'Price must be a positive number',
            'any.required': 'Price is required'
        }),
    salePrice: Joi.number()
        .positive()
        .precision(2)
        .less(Joi.ref('price'))
        .optional()
        .messages({
            'number.positive': 'Sale price must be a positive number',
            'number.less': 'Sale price must be less than regular price'
        }),
    category: Joi.string()
        .valid('keychain', 'flowers', 'baskets', 'accessories', 'custom')
        .required()
        .messages({
            'any.only': 'Category must be one of: keychain, flowers, baskets, accessories, custom',
            'any.required': 'Category is required'
        }),
    images: Joi.array()
        .items(
            Joi.object({
                url: Joi.string().uri().required(),
                alt: Joi.string().max(100).optional(),
                isPrimary: Joi.boolean().optional()
            })
        )
        .min(1)
        .max(10)
        .required()
        .messages({
            'array.min': 'At least one image is required',
            'array.max': 'Maximum 10 images allowed',
            'any.required': 'Product images are required'
        }),
    inStock: Joi.boolean().optional(),
    inventory: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
            'number.min': 'Inventory cannot be negative'
        }),
    lowStockThreshold: Joi.number()
        .integer()
        .min(0)
        .optional(),
    tags: Joi.array()
        .items(Joi.string().max(30))
        .max(20)
        .optional()
        .messages({
            'array.max': 'Maximum 20 tags allowed'
        }),
    featured: Joi.boolean().optional(),
    dimensions: Joi.object({
        length: Joi.number().positive().optional(),
        width: Joi.number().positive().optional(),
        height: Joi.number().positive().optional(),
        unit: Joi.string().valid('cm', 'inches').optional()
    }).optional(),
    weight: Joi.object({
        value: Joi.number().positive().optional(),
        unit: Joi.string().valid('g', 'kg').optional()
    }).optional(),
    materials: Joi.array()
        .items(Joi.string().max(50))
        .max(10)
        .optional(),
    careInstructions: Joi.string()
        .max(500)
        .optional(),
    customizationOptions: Joi.array()
        .items(
            Joi.object({
                name: Joi.string().max(50).required(),
                type: Joi.string().valid('color', 'size', 'text', 'pattern').required(),
                options: Joi.array().items(Joi.string().max(50)).required(),
                required: Joi.boolean().optional()
            })
        )
        .max(10)
        .optional(),
    isActive: Joi.boolean().optional()
});

// Order validation schemas
const orderSchema = Joi.object({
    items: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string().hex().length(24).required(),
                quantity: Joi.number().integer().min(1).max(100).required(),
                customization: Joi.array()
                    .items(
                        Joi.object({
                            option: Joi.string().required(),
                            value: Joi.string().required()
                        })
                    )
                    .optional()
            })
        )
        .min(1)
        .max(50)
        .required()
        .messages({
            'array.min': 'At least one item is required',
            'array.max': 'Maximum 50 items allowed per order',
            'any.required': 'Order items are required'
        }),
    shippingAddress: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        phone: Joi.string().pattern(/^\d{10}$/).required().messages({
            'string.pattern.base': 'Please enter a valid 10-digit phone number'
        }),
        street: Joi.string().min(5).max(200).required(),
        city: Joi.string().min(2).max(50).required(),
        state: Joi.string().min(2).max(50).required(),
        zipCode: Joi.string().pattern(/^\d{6}$/).required().messages({
            'string.pattern.base': 'Please enter a valid 6-digit zip code'
        }),
        country: Joi.string().max(50).optional()
    }).required(),
    billingAddress: Joi.object({
        name: Joi.string().min(2).max(50).optional(),
        phone: Joi.string().pattern(/^\d{10}$/).optional(),
        street: Joi.string().min(5).max(200).optional(),
        city: Joi.string().min(2).max(50).optional(),
        state: Joi.string().min(2).max(50).optional(),
        zipCode: Joi.string().pattern(/^\d{6}$/).optional(),
        country: Joi.string().max(50).optional()
    }).optional(),
    paymentMethod: Joi.string()
        .valid('cod', 'razorpay', 'stripe', 'paypal', 'upi')
        .required()
        .messages({
            'any.only': 'Payment method must be one of: cod, razorpay, stripe, paypal, upi'
        }),
    orderNotes: Joi.string().max(500).optional()
});

const orderUpdateSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'confirmed', 'processing', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned')
        .optional(),
    paymentStatus: Joi.string()
        .valid('pending', 'paid', 'failed', 'refunded', 'partially-refunded')
        .optional(),
    trackingNumber: Joi.string().max(100).optional(),
    shippingProvider: Joi.string().max(50).optional(),
    estimatedDelivery: Joi.date().min('now').optional(),
    adminNotes: Joi.string().max(1000).optional(),
    cancelReason: Joi.string().max(500).optional()
});

// Cart validation schemas
const cartItemSchema = Joi.object({
    productId: Joi.string().hex().length(24).required(),
    quantity: Joi.number().integer().min(1).max(100).required(),
    customization: Joi.array()
        .items(
            Joi.object({
                option: Joi.string().required(),
                value: Joi.string().required()
            })
        )
        .optional()
});

const cartUpdateSchema = Joi.object({
    items: Joi.array()
        .items(cartItemSchema)
        .max(50)
        .required()
        .messages({
            'array.max': 'Maximum 50 items allowed in cart'
        })
});

// Review validation schemas
const reviewSchema = Joi.object({
    productId: Joi.string().hex().length(24).required(),
    orderId: Joi.string().hex().length(24).optional(),
    rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
            'number.min': 'Rating must be at least 1',
            'number.max': 'Rating cannot exceed 5',
            'any.required': 'Rating is required'
        }),
    title: Joi.string()
        .max(100)
        .optional()
        .messages({
            'string.max': 'Review title cannot exceed 100 characters'
        }),
    comment: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
            'string.min': 'Comment must be at least 10 characters',
            'string.max': 'Comment cannot exceed 500 characters',
            'any.required': 'Comment is required'
        }),
    images: Joi.array()
        .items(Joi.string().uri())
        .max(5)
        .optional()
        .messages({
            'array.max': 'Maximum 5 images allowed per review'
        })
});

// Search validation schemas
const searchSchema = Joi.object({
    query: Joi.string().min(1).max(100).optional(),
    category: Joi.string()
        .valid('all', 'keychain', 'flowers', 'baskets', 'accessories', 'custom')
        .optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    featured: Joi.boolean().optional(),
    inStock: Joi.boolean().optional(),
    sortBy: Joi.string()
        .valid('name', 'price', 'createdAt', 'rating', 'popularity')
        .optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
}).custom((value, helpers) => {
    if (value.minPrice && value.maxPrice && value.minPrice >= value.maxPrice) {
        return helpers.error('custom.priceRange', {
            message: 'Minimum price must be less than maximum price'
        });
    }
    return value;
});

// Contact/Support validation schemas
const contactSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'any.required': 'Name is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
    phone: Joi.string()
        .pattern(/^\d{10}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please enter a valid 10-digit phone number'
        }),
    subject: Joi.string()
        .min(5)
        .max(100)
        .required()
        .messages({
            'string.min': 'Subject must be at least 5 characters',
            'any.required': 'Subject is required'
        }),
    message: Joi.string()
        .min(20)
        .max(1000)
        .required()
        .messages({
            'string.min': 'Message must be at least 20 characters',
            'string.max': 'Message cannot exceed 1000 characters',
            'any.required': 'Message is required'
        }),
    type: Joi.string()
        .valid('general', 'order', 'product', 'complaint', 'suggestion')
        .optional()
});

// Email validation schemas
const emailVerificationSchema = Joi.object({
    token: Joi.string().hex().length(64).required()
});

const passwordResetRequestSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        })
});

const passwordResetSchema = Joi.object({
    token: Joi.string().hex().length(64).required(),
    newPassword: Joi.string()
        .min(6)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'New password is required'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Password confirmation does not match',
            'any.required': 'Password confirmation is required'
        })
});

// Validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        next();
    };
};

// Query validation middleware
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Query validation failed',
                details: errors
            });
        }

        next();
    };
};

module.exports = {
    // Schemas
    userRegistrationSchema,
    userLoginSchema,
    userProfileUpdateSchema,
    passwordChangeSchema,
    productSchema,
    orderSchema,
    orderUpdateSchema,
    cartItemSchema,
    cartUpdateSchema,
    reviewSchema,
    searchSchema,
    contactSchema,
    emailVerificationSchema,
    passwordResetRequestSchema,
    passwordResetSchema,
    
    // Middleware
    validate,
    validateQuery
};