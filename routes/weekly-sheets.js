const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../src/lib/prisma');
const { generateWeeklySheet } = require('../src/lib/weekly-sheet');
const { startOfWeek, endOfWeek } = require('date-fns');
const router = express.Router();

// Generate weekly sheet
router.post('/', requireAuth, async (req, res) => {
  try {
    const { weekStart } = req.body;

    if (!weekStart) {
      return res.status(400).json({ error: 'Week start date is required' });
    }

    const weekStartDate = new Date(weekStart);
    const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });

    // Get user's publication
    const publication = await prisma.publication.findUnique({
      where: { userId: req.user.userId }
    });

    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    // Get notices for the week
    const notices = await prisma.publicNotice.findMany({
      where: {
        userId: req.user.userId,
        scheduledDate: {
          gte: weekStartDate,
          lte: weekEndDate,
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Generate the weekly sheet
    const filePath = await generateWeeklySheet(
      notices.map(notice => ({
        ...notice,
        scheduledDate: new Date(notice.scheduledDate),
      })),
      publication,
      weekStartDate
    );

    // Create or update weekly sheet record
    const existingSheet = await prisma.weeklySheet.findFirst({
      where: {
        publicationId: publication.id,
        weekStart: weekStartDate,
      },
    });

    let weeklySheet;
    if (existingSheet) {
      weeklySheet = await prisma.weeklySheet.update({
        where: { id: existingSheet.id },
        data: {
          generatedPath: filePath,
          weekEnd: weekEndDate,
        },
      });

      // Delete existing notice associations
      await prisma.weeklySheetNotice.deleteMany({
        where: { weeklySheetId: existingSheet.id },
      });
    } else {
      weeklySheet = await prisma.weeklySheet.create({
        data: {
          weekStart: weekStartDate,
          weekEnd: weekEndDate,
          generatedPath: filePath,
          publicationId: publication.id,
        },
      });
    }

    // Create notice associations
    if (notices.length > 0) {
      await prisma.weeklySheetNotice.createMany({
        data: notices.map(notice => ({
          weeklySheetId: weeklySheet.id,
          noticeId: notice.id,
        })),
      });
    }

    res.json({
      message: 'Weekly sheet generated successfully',
      filePath,
      weeklySheet,
      noticeCount: notices.length,
    });
  } catch (error) {
    console.error('Weekly sheet generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly sheets
router.get('/', requireAuth, async (req, res) => {
  try {
    // Get user's publication
    const publication = await prisma.publication.findUnique({
      where: { userId: req.user.userId }
    });

    if (!publication) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    // Get all weekly sheets for this publication
    const weeklySheets = await prisma.weeklySheet.findMany({
      where: { publicationId: publication.id },
      include: {
        notices: {
          include: {
            notice: {
              select: {
                id: true,
                title: true,
                scheduledDate: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { weekStart: 'desc' },
    });

    res.json({ weeklySheets });
  } catch (error) {
    console.error('Weekly sheets fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;