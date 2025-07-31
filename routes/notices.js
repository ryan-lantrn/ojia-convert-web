const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../src/lib/prisma');
const router = express.Router();

// Create notice
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, originalFilePath, scheduledDate } = req.body;

    if (!title || !originalFilePath || !scheduledDate) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      notice
    });
  } catch (error) {
    console.error('Notice creation error:', error);
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