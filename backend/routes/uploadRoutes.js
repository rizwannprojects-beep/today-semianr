import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import authenticate from '../middleware/authMiddleware.js';
import {
  upload,
  UPLOADS_DIR,
  deleteUploadedFile,
  ALLOWED_MIME_TYPES,
  MIME_TO_EXT,
  SAFE_FILENAME_REGEX,
  verifyImageMagicBytes
} from '../utils/fileUpload.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';
import environment from '../config/environment.js';

const router = Router();

/**
 * @desc Upload item images (multipart/form-data or base64 JSON)
 * @route POST /api/upload
 * @access Private
 */
router.post('/', authenticate, uploadLimiter, (req, res, next) => {
  // Check if content-type is multipart
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    upload.array('images', 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error',
          errors: [{ message: err.message }]
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files provided for upload',
          errors: [{ message: 'Missing image file in request' }]
        });
      }

      // Security check: Inspect magic bytes for every uploaded file
      for (const file of req.files) {
        try {
          const filePath = path.join(UPLOADS_DIR, file.filename);
          const fd = fs.openSync(filePath, 'r');
          const buffer = Buffer.alloc(16);
          fs.readSync(fd, buffer, 0, 16, 0);
          fs.closeSync(fd);

          if (!verifyImageMagicBytes(buffer)) {
            // Purge all files uploaded in this request
            req.files.forEach((f) => {
              try {
                fs.unlinkSync(path.join(UPLOADS_DIR, f.filename));
              } catch (_) {}
            });

            return res.status(400).json({
              success: false,
              message: `Security validation failed: File '${file.originalname}' has invalid binary image signatures.`,
              errors: [{ message: 'File magic bytes do not match permitted image formats' }]
            });
          }
        } catch (readErr) {
          return res.status(500).json({
            success: false,
            message: 'Failed to inspect uploaded file signatures',
            errors: [{ message: readErr.message }]
          });
        }
      }

      const urls = req.files.map((file) => `/uploads/${file.filename}`);

      return res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          urls,
          files: req.files.map((f) => ({
            filename: f.filename,
            originalName: f.originalname,
            size: f.size,
            mimetype: f.mimetype,
            url: `/uploads/${f.filename}`
          }))
        }
      });
    });
  } else if (req.body?.imageBase64 || req.body?.image) {
    // Direct base64 image upload fallback
    try {
      const rawData = req.body.imageBase64 || req.body.image;
      const matches = rawData.match(/^data:([^;]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        return res.status(400).json({
          success: false,
          message: 'Invalid base64 image data payload',
          errors: [{ message: 'Data must be a valid base64 image URI' }]
        });
      }

      const mimeType = matches[1].toLowerCase().trim();

      // Enforce strict allowed raster image MIME types
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return res.status(400).json({
          success: false,
          message: `Disallowed image type '${mimeType}'. Supported: JPEG, PNG, WEBP, GIF.`,
          errors: [{ message: 'Unsupported or insecure image MIME type' }]
        });
      }

      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Base64 image size exceeds maximum 5 MB limit',
          errors: [{ message: 'File size limit exceeded' }]
        });
      }

      // Security check: Verify magic bytes of the decoded buffer
      if (!verifyImageMagicBytes(buffer)) {
        return res.status(400).json({
          success: false,
          message: 'Binary inspection failed: Base64 payload does not contain valid image signatures.',
          errors: [{ message: 'Magic bytes mismatch for base64 image payload' }]
        });
      }

      const ext = MIME_TO_EXT[mimeType] || '.jpg';
      const filename = `item-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(filePath, buffer);

      return res.status(200).json({
        success: true,
        message: 'Base64 image uploaded successfully',
        data: {
          urls: [`/uploads/${filename}`],
          files: [{ filename, url: `/uploads/${filename}` }]
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Failed to process base64 upload',
        errors: [{ message: err.message }]
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: 'Unsupported upload format. Use multipart/form-data or base64 JSON payload.',
      errors: [{ message: 'No image attached' }]
    });
  }
});

/**
 * @desc Delete uploaded item image
 * @route DELETE /api/upload/:filename
 * @access Private
 */
router.delete('/:filename', authenticate, (req, res) => {
  const { filename } = req.params;

  if (!filename || !SAFE_FILENAME_REGEX.test(filename)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid filename specified for deletion',
      errors: [{ message: 'Filename format is invalid or attempts path traversal' }]
    });
  }

  const deleted = deleteUploadedFile(filename);

  if (deleted) {
    return res.status(200).json({
      success: true,
      message: 'Image removed from holding storage',
      data: {}
    });
  } else {
    return res.status(404).json({
      success: false,
      message: 'Image file not found or already purged',
      errors: [{ message: 'File does not exist' }]
    });
  }
});

export default router;
