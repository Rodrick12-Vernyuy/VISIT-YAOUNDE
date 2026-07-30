import { AccessTokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    // Passport declares `Request.user?: User`; extend that shared interface
    // instead of redeclaring `user` so the two augmentations merge cleanly.
    interface User extends AccessTokenPayload {}
  }
}

export {};
