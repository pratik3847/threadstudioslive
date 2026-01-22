const express = require('express');
const router = express.Router();
const { User, Product, Order } = require('../model/index');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        
        const revenueData = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email')
            .select('orderNumber totalAmount status createdAt');

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            pendingOrders,
            totalRevenue: revenueData[0]?.total || 0,
            recentOrders
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, role } = req.query;
        
        let filter = {};
        if (role) filter.role = role;

        const users = await User.find(filter)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await User.countDocuments(filter);

        res.json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;

        if (!['customer', 'admin'].includes(role)) {
            return res.status(400).json({ 
                error: 'Invalid role. Must be customer or admin' 
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: 'User role updated successfully',
            user
        });

    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
