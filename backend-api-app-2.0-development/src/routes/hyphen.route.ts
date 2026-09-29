import express from 'express';
import md5 from 'md5';
import HyphenController from '../controllers/hyphen/hyphen.controller';

const hyphen = express.Router();
const controller = new HyphenController();

hyphen.use(controller.hyphenAuth);

hyphen.post(
  '/order',
  controller.hyphenOrderReqVerify,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // CHECK IF res.locals === 'PO' OR 'CO'
    let myOrder = undefined;

    if (res.locals.orderType === 'CO') {
      myOrder = await controller.updateHyphenData(req, res, next);
    } else {
      myOrder = await controller.saveHyphenData(req, res, next);
    }

    if (myOrder) {
      return res.status(201).json(myOrder);
    } else {
      return res.status(500);
    }
  }
);

hyphen.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {}
);

export default hyphen;
