const express = require('express');
const router = express.Router();
const { Product } = require('../model/index');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, validateQuery } = require('../utils/validation');
const { productSchema, searchSchema } = require('../utils/validation');

// Get all products with filtering and pagination
router.get('/', validateQuery(searchSchema), async (req, res) => {
    try {
        const { 
            category, 
            featured, 
            search, 
            minPrice, 
            maxPrice,
            inStock,
            sortBy = 'createdAt',
            order = 'desc',
            page = 1, 
            limit = 12 
        } = req.query;
        
        // Treat legacy products (missing `isActive`) as active
        let filter = { $or: [{ isActive: true }, { isActive: { $exists: false } }] };
        
        if (category && category !== 'all') filter.category = category;
        if (featured !== undefined) filter.featured = featured === 'true';
        if (inStock !== undefined) filter.inStock = inStock === 'true';
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        const products = await Product.find(filter)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Product.countDocuments(filter);

        res.json({
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product || product.isActive === false) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ product });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create product (Admin only)
router.post('/', authenticateToken, requireAdmin, validate(productSchema), async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            createdBy: req.user._id
        });
        await product.save();
        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update product (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete product (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
