import express, { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';
import GlobalSearchController from '../controllers/globalSearch/globalSearch.controller';

const globalSearch = express.Router();
const controller = new GlobalSearchController();

globalSearch.get(
  '/:searchTerm',
  param('searchTerm').isString().exists(),
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.searchTerm.length < 3) {
      res
        .status(400)
        .json(
          'Bad request: the search term param must contain at least 3 characters.'
        );

      return res;
    }

    const response = await controller.getAllGlobalSearchRecords(req, res, next);
    return res.json(response);
  }
);

export default globalSearch;
