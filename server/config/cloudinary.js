import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  !cloudName.includes('placeholder') &&
  !cloudName.includes('your_')
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log('✅ Cloudinary configured successfully.');
} else {
  console.log('ℹ️ Cloudinary credentials not detected. Uploads will use local static storage (/uploads) gracefully.');
}

/**
 * Upload a file buffer or stream to Cloudinary or fallback to local disk storage
 * @param {Buffer} fileBuffer 
 * @param {string} originalName 
 * @param {string} folder 
 * @returns {Promise<{ url: string, public_id?: string, format?: string }>}
 */
export const uploadFile = async (fileBuffer, originalName = 'upload.jpg', folder = 'nexus-commerce') => {
  // If Cloudinary is configured, upload to Cloudinary CDN
  if (isConfigured) {
    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });

      return {
        url: result.secure_url || result.url,
        public_id: result.public_id,
        format: result.format,
      };
    } catch (err) {
      console.warn('[Cloudinary Upload Failed - Falling back to local storage]:', err.message);
    }
  }

  // Fallback: Save to local public uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalName) || '.jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, fileBuffer);

  // Return accessible static URL
  return {
    url: `/uploads/${fileName}`,
    public_id: fileName,
    format: ext.replace('.', ''),
  };
};

export default cloudinary;
