import { Request, Response } from 'express';
import { searchService } from '../services/search.service';
import { asyncHandler } from '../utils/asyncHandler';

export const searchController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const result = await searchService.search(req.query as Record<string, string>);
    res.status(200).json(result);
  }),
};
