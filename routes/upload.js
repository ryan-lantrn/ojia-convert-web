const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { saveUploadedFile, validateFileType } = require('../src/lib/upload');
const { prisma } = require('../src/lib/prisma');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { type } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!type || !['spec', 'pricing', 'notice'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file type specified' });
    }

    // Validate file type
    if (!validateFileType(file, type)) {
      return res.status(400).json({ error: `Invalid file format for ${type}` });
    }

    // Save the file
    const filePath = await saveUploadedFile(file, type);

    // Update publication record if it's a spec or pricing sheet
    if (type === 'spec' || type === 'pricing') {
      const updateData = type === 'spec' 
        ? { specSheetPath: filePath }
        : { pricingSheetPath: filePath };

      await prisma.publication.update({
        where: { userId: req.user.userId },
        data: updateData
      });
    }

    res.json({
      message: 'File uploaded successfully',
      filePath,
      type
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.message?.includes('File size exceeds')) {
      return res.status(413).json({ error: error.message });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Publication not found. Please create a publication profile first.' 
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;