const Anthropic = require('@anthropic-ai/sdk');
const { readFile } = require('fs/promises');
const path = require('path');
const { UPLOAD_DIR } = require('./upload');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

async function convertNoticeToInDesign(noticeFilePath, specSheetPath, pricingSheetPath) {
  try {
    // Read the notice file
    const fullNoticePath = path.join(UPLOAD_DIR, noticeFilePath);
    const noticeContent = await readFile(fullNoticePath, 'utf-8');

    // Read the spec sheet (we'll read it as text for now)
    const fullSpecPath = path.join(UPLOAD_DIR, specSheetPath);
    let specContent = '';
    
    try {
      specContent = await readFile(fullSpecPath, 'utf-8');
    } catch (error) {
      // If we can't read as text, use the predefined InDesign specs
      specContent = `
        InDesign Specifications:
        - Page Size: 2 inches wide × auto height
        - Margins: 0.05" all sides
        - Font: Arial, 7.5pt base size
        - Leading: 8.6pt (115% of font size)
        - Text Styles: Various styles for headers, body text, contact info
      `;
    }

    const prompt = `
You are an expert InDesign conversion specialist. Convert the following public notice text into a structured InDesign format based on the provided specifications.

SPECIFICATIONS:
${specContent}

NOTICE CONTENT:
${noticeContent}

Please provide:
1. Clean, structured text content
2. InDesign markup with proper styling tags
3. Formatting instructions for each section

Focus on:
- Proper text hierarchy (headers, body, contact info)
- Compliance with the 2-inch width constraint
- Proper font sizing and spacing
- Legal notice formatting requirements

Return the response in JSON format with these fields:
- content: The clean text content
- indesignMarkup: The formatted text with InDesign tags
- instructions: Step-by-step formatting instructions
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Try to parse as JSON, fallback to plain text
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = {
        content: noticeContent,
        indesignMarkup: responseText,
        instructions: 'Manual formatting required'
      };
    }

    return {
      success: true,
      content: result.content || noticeContent,
      indesignMarkup: result.indesignMarkup || responseText,
    };
  } catch (error) {
    console.error('Claude conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
}

async function extractTextFromFile(filePath) {
  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
      case '.txt':
      case '.rtf':
        return await readFile(fullPath, 'utf-8');
      
      case '.pdf':
        // For PDF, we'd need a PDF parser library
        // For now, return a placeholder
        return 'PDF content extraction not yet implemented. Please use TXT, DOCX, or RTF files.';
      
      case '.docx':
      case '.doc':
        // For Word docs, we'd need a Word parser library  
        // For now, return a placeholder
        return 'Word document content extraction not yet implemented. Please use TXT or RTF files.';
      
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
}

module.exports = {
  convertNoticeToInDesign,
  extractTextFromFile
};