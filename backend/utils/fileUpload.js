import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
export const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Strict Allowed Raster Image MIME types (SVG explicitly excluded to prevent Stored XSS)
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// Mapping to strictly authorized extensions (never trust client file.originalname extension)
export const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

// Safe filename regex pattern to prevent directory traversal
export const SAFE_FILENAME_REGEX = /^item-\d+-[a-f0-9]+\.(jpg|jpeg|png|webp|gif)$/i;

/**
 * Validates actual binary signatures (magic bytes) of an image buffer
 * Supports JPEG, PNG, GIF, WEBP
 */
export const verifyImageMagicBytes = (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 12) {
    return false;
  }

  // 1. JPEG: starts with FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // 2. PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return true;
  }

  // 3. GIF: starts with 'GIF87a' or 'GIF89a' (47 49 46 38 37 61 or 47 49 46 38 39 61)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return true;
  }

  // 4. WEBP: 'RIFF' at 0..3 (52 49 46 46) and 'WEBP' at 8..11 (57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
};

// Multer disk storage engine with strictly controlled extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Derive extension strictly from validated MIME type, ignoring client extension
    const ext = MIME_TO_EXT[file.mimetype.toLowerCase()] || '.jpg';
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `item-${uniqueSuffix}${ext}`);
  }
});

// File filter validator
const fileFilter = (req, file, cb) => {
  const normMime = file.mimetype?.toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(normMime)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type '${file.mimetype}'. Supported formats: JPEG, PNG, WEBP, GIF. Vector formats (SVG) are disallowed for security.`
      ),
      false
    );
  }
};

// 5 MB limit per image
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 5 // max 5 images per report
  }
});

// Helper to remove an uploaded file safely with directory traversal check
export const deleteUploadedFile = (filename) => {
  try {
    const safeBase = path.basename(filename);
    if (!SAFE_FILENAME_REGEX.test(safeBase)) {
      console.warn(`[Security Warning] Blocked suspicious file deletion attempt: '${filename}'`);
      return false;
    }
    const targetPath = path.join(UPLOADS_DIR, safeBase);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return true;
    }
  } catch (err) {
    console.error(`[Upload Error] Could not delete file: ${err.message}`);
  }
  return false;
};

export default upload;
