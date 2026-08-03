import { env } from '../config/env';
import { cloudinary } from '../config/cloudinary';

export interface UploadedImage {
  url: string;
  publicId?: string;
}

export async function storeImage(file: Express.Multer.File): Promise<UploadedImage> {
  if (env.cloudinary.enabled) {
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'visit-yaounde/attractions' },
        (error, uploadResult) => {
          if (error || !uploadResult) return reject(error ?? new Error('Cloudinary upload failed'));
          resolve(uploadResult as { secure_url: string; public_id: string });
        }
      );
      stream.end(file.buffer);
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  return { url: `/uploads/${file.filename}` };
}

export async function deleteImage(publicId?: string | null): Promise<void> {
  if (env.cloudinary.enabled && publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
}
