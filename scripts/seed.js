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

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@threadstudioss.com',
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
        console.log('👤 Created admin user');

        // Create sample customer
        const customerPassword = await bcrypt.hash('customer123', 12);
        const customerUser = new User({
            name: 'John Doe',
            email: 'customer@example.com',
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
        console.log('👤 Created sample customer');

        // Create sample products
        const products = [
            {
                name: 'Crocheted Rose Bouquet',
                description: 'Beautiful handmade rose bouquet crafted with premium cotton yarn. Perfect for gifting or home decoration. Available in red, pink, and white.',
                price: 599,
                category: 'flowers',
                images: [
                    { url: 'flower.jpeg', alt: 'Crocheted Rose Bouquet' }
                ],
                inStock: true,
                inventory: 15,
                tags: ['roses', 'bouquet', 'handmade', 'cotton'],
                featured: true
            },
            {
                name: 'Cute Animal Keychain',
                description: 'Adorable handmade animal keychains perfect for your keys or as a bag accessory. Available in various animals like cats, dogs, bears, and rabbits.',
                price: 199,
                category: 'keychain',
                images: [
                    { url: 'keychain.jpg', alt: 'Cute Animal Keychain' }
                ],
                inStock: true,
                inventory: 50,
                tags: ['keychain', 'animals', 'cute', 'accessories'],
                featured: true
            },
            {
                name: 'Flower Basket Arrangement',
                description: 'Elegant flower basket filled with colorful crocheted flowers. A perfect centerpiece for any room or special occasion. Comes with a handwoven basket.',
                price: 799,
                category: 'baskets',
                images: [
                    { url: 'flowerbasket.jpg', alt: 'Flower Basket Arrangement' }
                ],
                inStock: true,
                inventory: 10,
                tags: ['basket', 'flowers', 'centerpiece', 'decoration'],
                featured: true
            },
            {
                name: 'Sunflower Bunch',
                description: 'Bright and cheerful crocheted sunflowers that bring sunshine to any space. Set of 5 sunflowers with stems.',
                price: 449,
                category: 'flowers',
                images: [
                    { url: 'flower.jpeg', alt: 'Sunflower Bunch' }
                ],
                inStock: true,
                inventory: 20,
                tags: ['sunflower', 'bright', 'cheerful', 'set'],
                featured: false
            },
            {
                name: 'Personalized Name Keychain',
                description: 'Custom name keychains made to order. Choose your favorite colors and get your name or any text crocheted beautifully.',
                price: 299,
                category: 'keychain',
                images: [
                    { url: 'keychain.jpg', alt: 'Personalized Name Keychain' }
                ],
                inStock: true,
                inventory: 100,
                tags: ['personalized', 'custom', 'name', 'keychain'],
                featured: false
            },
            {
                name: 'Mini Plant Pot Cover',
                description: 'Cute mini pot covers for your small plants. Made with soft cotton yarn in various colors and patterns.',
                price: 349,
                category: 'accessories',
                images: [
                    { url: 'flowerbasket.jpg', alt: 'Mini Plant Pot Cover' }
                ],
                inStock: true,
                inventory: 25,
                tags: ['pot cover', 'plants', 'home decor', 'mini'],
                featured: false
            },
            {
                name: 'Custom Birthday Bouquet',
                description: 'Special birthday bouquet with customizable colors and flower types. Perfect for birthdays and celebrations.',
                price: 699,
                category: 'custom',
                images: [
                    { url: 'flower.jpeg', alt: 'Custom Birthday Bouquet' }
                ],
                inStock: true,
                inventory: 5,
                tags: ['birthday', 'custom', 'celebration', 'special'],
                featured: false
            },
            {
                name: 'Lavender Bouquet',
                description: 'Calming lavender-colored flower bouquet with a subtle fragrance. Perfect for relaxation and aromatherapy.',
                price: 549,
                category: 'flowers',
                images: [
                    { url: 'flower.jpeg', alt: 'Lavender Bouquet' }
                ],
                inStock: true,
                inventory: 12,
                tags: ['lavender', 'calming', 'aromatherapy', 'purple'],
                featured: false
            },
            {
                name: 'Heart Keychain Set',
                description: 'Set of 3 heart-shaped keychains in different sizes. Perfect for couples or best friends.',
                price: 399,
                category: 'keychain',
                images: [
                    { url: 'keychain.jpg', alt: 'Heart Keychain Set' }
                ],
                inStock: true,
                inventory: 30,
                tags: ['heart', 'set', 'couples', 'love'],
                featured: false
            },
            {
                name: 'Hanging Flower Basket',
                description: 'Beautiful hanging basket with cascading crocheted flowers. Perfect for balconies and patios.',
                price: 899,
                category: 'baskets',
                images: [
                    { url: 'flowerbasket.jpg', alt: 'Hanging Flower Basket' }
                ],
                inStock: true,
                inventory: 8,
                tags: ['hanging', 'cascading', 'balcony', 'patio'],
                featured: false
            }
        ];

        await Product.insertMany(products);
        console.log(`🌸 Created ${products.length} sample products`);

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`👤 Users created: 2 (1 admin, 1 customer)`);
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