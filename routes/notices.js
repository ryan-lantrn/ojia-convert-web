const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../src/lib/prisma');
const { saveUploadedFile, validateFileType } = require('../src/lib/upload');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Create notice with file upload
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { title, scheduledDate } = req.body;
    const file = req.file;

    if (!title || !scheduledDate) {
      return res.status(400).json({ error: 'Missing title or scheduled date' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file type for notices
    if (!validateFileType(file, 'notice')) {
      return res.status(400).json({ error: 'Invalid file format for notice' });
    }

    // Get the user's publication
    const publication = await prisma.publication.findUnique({
      where: { userId: req.user.userId }
    });

    if (!publication) {
      return res.status(404).json({ 
        error: 'Publication not found. Please create a publication profile first.' 
      });
    }

    // Save the uploaded file
    const originalFilePath = await saveUploadedFile(file, 'notices');

    // Create the notice
    const notice = await prisma.publicNotice.create({
      data: {
        title,
        content: '', // Will be extracted during conversion
        originalFilePath,
        scheduledDate: new Date(scheduledDate),
        status: 'PENDING',
        userId: req.user.userId,
        publicationId: publication.id,
      },
    });

    res.status(201).json({
      message: 'Notice created successfully',
      notice,
      filePath: originalFilePath
    });
  } catch (error) {
    console.error('Notice creation error:', error);
    
    if (error.message?.includes('File size exceeds')) {
      return res.status(413).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notices
router.get('/', requireAuth, async (req, res) => {
  try {
    const notices = await prisma.publicNotice.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        publication: {
          select: { name: true }
        }
      }
    });

    res.json({ notices });
  } catch (error) {
    console.error('Notice fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;