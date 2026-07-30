import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

if (env.cloudinary.enabled) {
  cloudinary.config({ secure: true });
}

export { cloudinary };
