const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../src/lib/prisma');
const router = express.Router();

// Create publication
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, address, phone, email, website } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Publication name is required' });
    }

    const existingPublication = await prisma.publication.findUnique({
      where: { userId: req.user.userId }
    });

    if (existingPublication) {
      return res.status(409).json({ 
        error: 'Publication already exists. Use PUT to update.' 
      });
    }

    const publication = await prisma.publication.create({
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      message: 'Publication created successfully',
      publication
    });
  } catch (error) {
    console.error('Publication creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update publication
router.put('/', requireAuth, async (req, res) => {
  try {
    const { name, address, phone, email, website } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Publication name is required' });
    }

    const publication = await prisma.publication.update({
      where: { userId: req.user.userId },
      data: {
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
      },
    });

    res.json({
      message: 'Publication updated successfully',
      publication
    });
  } catch (error) {
    console.error('Publication update error:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Publication not found' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get publication
router.get('/', requireAuth, async (req, res) => {
  try {
    const publication = await prisma.publication.findUnique({
      where: { userId: req.user.userId }
    });

    res.json({ publication });
  } catch (error) {
    console.error('Publication fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;