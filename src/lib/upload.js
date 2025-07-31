const { writeFile, mkdir } = require('fs/promises');
const { existsSync } = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function saveUploadedFile(file, subfolder = '') {
  await ensureUploadDir();

  // For multer files, use file.buffer instead of arrayBuffer
  const buffer = file.buffer;

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  const extension = path.extname(file.originalname);
  const filename = `${uuidv4()}${extension}`;
  const uploadPath = subfolder 
    ? path.join(UPLOAD_DIR, subfolder)
    : UPLOAD_DIR;

  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true });
  }

  const filePath = path.join(uploadPath, filename);
  await writeFile(filePath, buffer);

  return subfolder 
    ? path.join(subfolder, filename)
    : filename;
}

function getFileUrl(filePath) {
  return `/uploads/${filePath}`;
}

const ALLOWED_FILE_TYPES = {
  spec: ['.pdf', '.indd', '.idml', '.docx', '.doc'],
  pricing: ['.pdf', '.xlsx', '.xls', '.csv', '.docx', '.doc'],
  notice: ['.pdf', '.docx', '.doc', '.txt', '.rtf']
};

function validateFileType(file, type) {
  const extension = path.extname(file.originalname).toLowerCase();
  return ALLOWED_FILE_TYPES[type].includes(extension);
}

module.exports = {
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  ensureUploadDir,
  saveUploadedFile,
  getFileUrl,
  ALLOWED_FILE_TYPES,
  validateFileType
};