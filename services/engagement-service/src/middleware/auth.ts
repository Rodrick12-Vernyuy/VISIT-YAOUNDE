import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing bearer token'));
  }

  try {
    req.user = verifyAccessToken(header.slice('Bearer '.length));
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}
