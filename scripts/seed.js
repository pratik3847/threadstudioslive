const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/threadstudioss', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

// Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['keychain', 'flowers', 'baskets', 'accessories', 'custom']
    },
    images: [{
        url: String,
        alt: String
    }],
    inStock: {
        type: Boolean,
        default: true
    },
    inventory: {
        type: Number,
        default: 1
    },
    tags: [String],
    featured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Models
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// Seed data
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing product data (do NOT delete users)
        await Product.deleteMany({});
        console.log('🧹 Cleared existing products');

        let usersCreated = 0;

        // Create demo admin user if it doesn't already exist
        const adminEmail = 'admin@threadstudioss.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            const adminUser = new User({
                name: 'Admin User',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                phone: '9876543210',
                address: {
                    street: '123 Craft Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400001',
                    country: 'India'
                }
            });

            await adminUser.save();
            usersCreated += 1;
            console.log('👤 Created admin user');
        } else {
            console.log('👤 Admin user already exists (skipped)');
        }

        // Create demo customer if it doesn't already exist
        const customerEmail = 'customer@example.com';
        const existingCustomer = await User.findOne({ email: customerEmail });
        if (!existingCustomer) {
            const customerPassword = await bcrypt.hash('customer123', 12);
            const customerUser = new User({
                name: 'John Doe',
                email: customerEmail,
                password: customerPassword,
                role: 'customer',
                isVerified: true,
                phone: '9876543211',
                address: {
                    street: '456 Main Street',
                    city: 'Pune',
                    state: 'Maharashtra',
                    zipCode: '411001',
                    country: 'India'
                }
            });

            await customerUser.save();
            usersCreated += 1;
            console.log('👤 Created sample customer');
        } else {
            console.log('👤 Sample customer already exists (skipped)');
        }

        // Create products that match the images you provided (one product per image file)
        const products = [
            {
                name: 'Cute Keychain',
                description: 'Adorable handmade animal keychain perfect for your keys or as a bag accessory.',
                price: 199,
                category: 'keychain',
                images: [{ url: 'keychain.jpg', alt: 'Cute Animal Keychain' }],
                inStock: true,
                inventory: 50,
                tags: ['keychain', 'cute', 'accessory'],
                featured: true
            },
            {
                name: 'Flower Basket Arrangement',
                description: 'Elegant flower basket filled with colorful crocheted flowers. A perfect centerpiece for any room.',
                price: 799,
                category: 'baskets',
                images: [{ url: 'flowerbasket.jpg', alt: 'Flower Basket Arrangement' }],
                inStock: true,
                inventory: 10,
                tags: ['basket', 'flowers', 'decor'],
                featured: true
            },
            {
                name: 'Classic Flower Bouquet',
                description: 'A beautiful classic bouquet made with premium yarn. Perfect for gifting and home decoration.',
                price: 599,
                category: 'flowers',
                images: [{ url: 'flower.jpeg', alt: 'Classic Flower Bouquet' }],
                inStock: true,
                inventory: 15,
                tags: ['bouquet', 'handmade', 'gift'],
                featured: true
            },
            {
                name: 'Crocheted Summer Top',
                description: 'Stylish handmade summer top perfect for warm weather. Made with breathable cotton yarn.',
                price: 1299,
                category: 'accessories',
                images: [{ url: 'crocheted top.jpg', alt: 'Crocheted Summer Top' }],
                inStock: true,
                inventory: 15,
                tags: ['top', 'summer', 'handmade'],
                featured: true
            },
            {
                name: 'Crocheted Flower Pot Cover',
                description: 'Decorative pot cover with intricate flower patterns. Perfect for dressing up your indoor plants.',
                price: 449,
                category: 'accessories',
                images: [{ url: 'crochetedflowerpot.png', alt: 'Crocheted Flower Pot Cover' }],
                inStock: true,
                inventory: 20,
                tags: ['pot cover', 'plants', 'home decor'],
                featured: false
            },
            {
                name: 'Premium Roses Bouquet',
                description: 'Exquisite handcrafted roses bouquet with detailed petals and realistic appearance.',
                price: 899,
                category: 'flowers',
                images: [{ url: 'crochetedrosesbouqet.png', alt: 'Premium Roses Bouquet' }],
                inStock: true,
                inventory: 12,
                tags: ['roses', 'romantic', 'gift'],
                featured: true
            },
            {
                name: 'Adorable Soft Toy',
                description: 'Cuddly soft toy perfect for gifting. Made with super soft yarn in vibrant colors.',
                price: 799,
                category: 'accessories',
                images: [{ url: 'crochetedsofttoy.png', alt: 'Adorable Soft Toy' }],
                inStock: true,
                inventory: 25,
                tags: ['soft toy', 'gift', 'handmade'],
                featured: true
            },
            {
                name: 'Bright Sunflower Bouquet',
                description: 'Cheerful sunflower bouquet that brings warmth and happiness to any space.',
                price: 649,
                category: 'flowers',
                images: [{ url: 'crochetedsunflowerbouqet.png', alt: 'Bright Sunflower Bouquet' }],
                inStock: true,
                inventory: 18,
                tags: ['sunflower', 'cheerful', 'decor'],
                featured: true
            },
            {
                name: 'Heart-Shaped Flower Arrangement',
                description: 'Romantic heart-shaped flower arrangement perfect for anniversaries or special occasions.',
                price: 749,
                category: 'flowers',
                images: [{ url: 'heartshapeflower.png', alt: 'Heart-Shaped Flower Arrangement' }],
                inStock: true,
                inventory: 14,
                tags: ['heart', 'romantic', 'gift'],
                featured: true
            },
            {
                name: 'Elegant Lily Bouquet',
                description: 'Sophisticated lily bouquet with graceful stems and beautiful blooms.',
                price: 699,
                category: 'flowers',
                images: [{ url: 'lilybouqet.png', alt: 'Elegant Lily Bouquet' }],
                inStock: true,
                inventory: 16,
                tags: ['lily', 'elegant', 'gift'],
                featured: false
            }
        ];

        await Product.insertMany(products);
        console.log(`🌸 Created ${products.length} sample products`);

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`👤 Users created: ${usersCreated} (existing users preserved)`);
        console.log(`🌸 Products created: ${products.length}`);
        console.log('\n🔐 Admin Login:');
        console.log('Email: admin@threadstudioss.com');
        console.log('Password: admin123');
        console.log('\n🔐 Customer Login:');
        console.log('Email: customer@example.com');
        console.log('Password: customer123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the seed function
seedDatabase();