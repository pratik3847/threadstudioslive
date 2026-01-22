const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Multer config for memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload single image
router.post('/upload', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'threadstudioss',
            resource_type: 'auto'
        });

        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Image upload failed' });
    }
});

// Upload multiple images
router.post('/upload-multiple', authenticateToken, requireAdmin, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const uploadPromises = req.files.map(file => {
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;
            
            return cloudinary.uploader.upload(dataURI, {
                folder: 'threadstudioss',
                resource_type: 'auto'
            });
        });

        const results = await Promise.all(uploadPromises);
        
        res.json({
            success: true,
            images: results.map(r => ({
                url: r.secure_url,
                publicId: r.public_id
            }))
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Image upload failed' });
    }
});

// Delete image
router.delete('/delete/:publicId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const publicId = req.params.publicId.replace(/_/g, '/');
        await cloudinary.uploader.destroy(publicId);
        res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Image deletion failed' });
    }
});

module.exports = router;
