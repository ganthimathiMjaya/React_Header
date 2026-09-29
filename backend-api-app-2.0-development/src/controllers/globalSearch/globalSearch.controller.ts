import { Request, Response, NextFunction } from 'express';
import GlobalSearchService from '../../services/globalSearch/globalSearch.service';
const service = new GlobalSearchService();

export default class GlobalSearchController {
  public async getAllGlobalSearchRecords(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await service.getAllGlobalSearchRecords(
        res.locals.orgId,
        req.params.searchTerm
      );
      return response;
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in GlobalSearchController.getGlobalSearchRecords',
      });
    }
  }
}
