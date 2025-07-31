const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../src/lib/prisma');
const { convertNoticeToInDesign, extractTextFromFile } = require('../src/lib/claude');
const { writeFile, mkdir } = require('fs/promises');
const path = require('path');
const { UPLOAD_DIR } = require('../src/lib/upload');
const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { noticeId } = req.body;

    if (!noticeId) {
      return res.status(400).json({ error: 'Notice ID is required' });
    }

    // Get the notice and publication info
    const notice = await prisma.publicNotice.findFirst({
      where: {
        id: noticeId,
        userId: req.user.userId,
      },
      include: {
        publication: true,
      },
    });

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    if (!notice.publication.specSheetPath) {
      return res.status(400).json({ 
        error: 'InDesign specification sheet not found. Please upload it first.' 
      });
    }

    // Update status to processing
    await prisma.publicNotice.update({
      where: { id: noticeId },
      data: { status: 'PROCESSING' },
    });

    try {
      // Extract text content from the uploaded file
      const textContent = await extractTextFromFile(notice.originalFilePath);

      // Convert using Claude API
      const conversionResult = await convertNoticeToInDesign(
        notice.originalFilePath,
        notice.publication.specSheetPath,
        notice.publication.pricingSheetPath || undefined
      );

      if (!conversionResult.success) {
        await prisma.publicNotice.update({
          where: { id: noticeId },
          data: { 
            status: 'ERROR',
            content: textContent,
          },
        });

        return res.status(500).json({
          error: conversionResult.error || 'Conversion failed'
        });
      }

      // Save the converted file
      const convertedFileName = `converted_${Date.now()}_${notice.id}.idml`;
      const convertedFilePath = path.join('converted', convertedFileName);
      const fullConvertedPath = path.join(UPLOAD_DIR, convertedFilePath);

      // Ensure converted directory exists
      const convertedDir = path.dirname(fullConvertedPath);
      try {
        await mkdir(convertedDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      // Write the InDesign markup to file
      await writeFile(fullConvertedPath, conversionResult.indesignMarkup || '');

      // Update the notice with converted content
      await prisma.publicNotice.update({
        where: { id: noticeId },
        data: {
          status: 'CONVERTED',
          content: conversionResult.content || textContent,
          convertedFilePath,
        },
      });

      res.json({
        message: 'Notice converted successfully',
        convertedFilePath,
        content: conversionResult.content,
      });
    } catch (conversionError) {
      console.error('Conversion process error:', conversionError);
      
      // Update status to error
      await prisma.publicNotice.update({
        where: { id: noticeId },
        data: { status: 'ERROR' },
      });

      res.status(500).json({ error: 'Conversion process failed' });
    }
  } catch (error) {
    console.error('Convert API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;