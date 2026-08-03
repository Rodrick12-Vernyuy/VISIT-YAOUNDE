import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const internalController = {
  listByIds: asyncHandler(async (req: Request, res: Response) => {
    const idsParam = req.query.ids;
    if (typeof idsParam !== 'string' || !idsParam) {
      throw ApiError.badRequest('Query param "ids" is required (comma-separated user ids)');
    }
    const ids = idsParam.split(',').filter(Boolean);
    const users = await userRepository.findByIds(ids);
    res.status(200).json({ users });
  }),
};
