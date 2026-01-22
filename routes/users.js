const express = require('express');
const router = express.Router();
const { User } = require('../model/index');
const { validate } = require('../utils/validation');
const { userProfileUpdateSchema, passwordChangeSchema } = require('../utils/validation');
const bcrypt = require('bcryptjs');

// Get current user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -refreshToken');
        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
router.put('/profile', validate(userProfileUpdateSchema), async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        res.json({
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Change password
router.put('/change-password', validate(passwordChangeSchema), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        // Check if user has password (OAuth users don't)
        if (!user.password) {
            return res.status(400).json({ 
                error: 'Cannot change password for OAuth accounts' 
            });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ 
                error: 'Current password is incorrect' 
            });
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
