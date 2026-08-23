import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

/**
 * Guards the /internal/* routes so only other backend services (which share
 * this token via env vars) can call them — never the public internet.
 */
export function requireInternalService(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers['x-internal-token'];
  if (token !== env.internalServiceToken) {
    return next(ApiError.unauthorized('Invalid internal service token'));
  }
  return next();
}
