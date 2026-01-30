const express = require('express');
const router = express.Router();
const { Order, Product } = require('../model/index');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../utils/validation');
const { orderSchema, orderUpdateSchema } = require('../utils/validation');

// Create order
router.post('/', authenticateToken, validate(orderSchema), async (req, res) => {
    try {
        const { items, shippingAddress, billingAddress, orderNotes, paymentMethod } = req.body;

        // Calculate totals and validate products
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product || product.isActive === false) {
                return res.status(400).json({ 
                    error: `Product ${item.productId} not found or unavailable` 
                });
            }

            if (!product.inStock || product.inventory < item.quantity) {
                return res.status(400).json({ 
                    error: `Product "${product.name}" is out of stock or insufficient inventory` 
                });
            }

            const price = product.salePrice || product.price;
            const orderItem = {
                productId: product._id,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice,
                quantity: item.quantity,
                image: product.images[0]?.url || '',
                customization: item.customization
            };

            orderItems.push(orderItem);
            subtotal += price * item.quantity;
        }

        // Calculate tax and shipping (customize as needed)
        const tax = subtotal * 0.0; // 0% tax for now
        const shippingCost = subtotal > 1000 ? 0 : 50; // Free shipping over ₹1000
        const totalAmount = subtotal + tax + shippingCost;

        const order = new Order({
            userId: req.user._id,
            items: orderItems,
            subtotal,
            tax,
            shippingCost,
            totalAmount,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            orderNotes,
            paymentMethod: paymentMethod || 'cod',
            statusHistory: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Order placed'
            }]
        });

        await order.save();

        // Update product inventory
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { inventory: -item.quantity }
            });
        }

        res.status(201).json({
            message: 'Order created successfully',
            order
        });

    } catch (error) {
        console.error('Create order error:', error);
        if (error?.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        if (error?.code === 11000) {
            return res.status(409).json({ error: 'Duplicate order detected, please retry' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        let filter = { userId: req.user._id };
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .populate('items.productId', 'name images')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Order.countDocuments(filter);

        res.json({
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('items.productId', 'name images');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel order (customer)
router.post('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const { cancelReason } = req.body;
        
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({ 
                error: 'Order cannot be cancelled at this stage' 
            });
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancelReason = cancelReason;
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: cancelReason || 'Cancelled by customer'
        });

        await order.save();

        // Restore product inventory
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { inventory: item.quantity }
            });
        }

        res.json({
            message: 'Order cancelled successfully',
            order
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin: Get all orders
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        let filter = {};
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .populate('userId', 'name email')
            .populate('items.productId', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Order.countDocuments(filter);

        res.json({
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });

    } catch (error) {
        console.error('Get admin orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin: Update order status
router.put('/:id/status', authenticateToken, requireAdmin, validate(orderUpdateSchema), async (req, res) => {
    try {
        const { 
            status, 
            trackingNumber, 
            shippingProvider, 
            estimatedDelivery, 
            adminNotes 
        } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (status) {
            order.status = status;
            order.statusHistory.push({
                status,
                timestamp: new Date(),
                note: adminNotes || `Status updated to ${status}`,
                updatedBy: req.user._id
            });

            if (status === 'delivered') {
                order.deliveredAt = new Date();
                order.paymentStatus = 'paid'; // Auto-mark as paid on delivery for COD
            }
        }

        // Allow appending a log entry without changing status
        if (!status && adminNotes) {
            order.statusHistory.push({
                status: order.status,
                timestamp: new Date(),
                note: adminNotes,
                updatedBy: req.user._id
            });
        }

        if (trackingNumber) order.trackingNumber = trackingNumber;
        if (shippingProvider) order.shippingProvider = shippingProvider;
        if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
        if (adminNotes) order.adminNotes = adminNotes;

        order.updatedAt = new Date();
        await order.save();

        res.json({
            message: 'Order updated successfully',
            order
        });

    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
