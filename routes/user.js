const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../src/lib/prisma');
const router = express.Router();

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('User profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;