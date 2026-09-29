import { NextFunction, Request, Response } from 'express';
import ServicesManagementService from '../../services/servicesManagement/servicesManagement.service';
const service = new ServicesManagementService();

export default class ServicesManagementController {
  public async getAllJobTypes(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      return await service.getAllJobTypes(orgId);
    } catch (error) {
      console.log(
        `Could not retrieve all job types associated to orgId ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async getJobType(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      const jobTypeId = parseInt(req.params?.jobTypeId);
      if (
        req.params === undefined ||
        req.params?.jobTypeId === undefined ||
        isNaN(jobTypeId)
      ) {
        res
          .status(400)
          .json('Bad request: jobTypeId is not provided or is invalid.');
        return;
      }

      return await service.getJobType(orgId, jobTypeId);
    } catch (error) {
      console.log(
        `Could not retrieve job type associated to orgId ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async getJobSubType(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      const jobSubTypeId = parseInt(req.params?.jobSubTypeId);
      if (
        req.params === undefined ||
        req.params?.jobSubTypeId === undefined ||
        isNaN(jobSubTypeId)
      ) {
        res
          .status(400)
          .json('Bad request: jobSubTypeId is not provided or is invalid.');
        return;
      }

      return await service.getJobSubType(orgId, jobSubTypeId);
    } catch (error) {
      console.log(
        `Could not retrieve job subtype associated to orgId ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async getAllJobSubTypes(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      return await service.getAllJobSubTypes(orgId);
    } catch (error) {
      console.log(
        `Could not retrieve all jobsubtypes associated to orgId ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async addJobSubType(req: Request, res: Response, next: NextFunction) {
    const orgId = res.locals.orgId;
    try {
      const jobSubType = await service.addJobSubType(
        orgId,
        req.body.jobSubType
      );
      return res.json(jobSubType);
    } catch (error) {
      next({
        error,
        message: `Could not create new JobType and/or JobSubTypes for orgID ${orgId} due to the following error: ${error}`,
        errorPath: 'Error in ServicesManagementController.addJobType',
      });
    }
  }

  public async updateJobSubType(req: Request, res: Response, next: NextFunction) {
    const orgId = res.locals.orgId;
    try {
      const jobSubType = await service.updateJobSubType(orgId, req.body.jobSubType);
      return res.json(jobSubType);
    } catch (error) {
      next({
        error,
        message: `Could not update JobSubTypes for orgID ${orgId} due to the following error: ${error}`,
        errorPath: 'Error in ServicesManagementController.updateJobSubType',
      });
    }
  }
  public async deleteJobType(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      const jobTypeId = parseInt(req.params?.jobTypeId);
      if (
        req.params === undefined ||
        req.params?.jobTypeId === undefined ||
        isNaN(jobTypeId)
      ) {
        res
          .status(400)
          .json('Bad request: jobTypeId is not provided or is invalid.');
        return;
      }

      await service.deleteJobType(orgId, parseInt(req.params?.jobTypeId));
    } catch (error) {
      console.log(
        `Could not delete JobType and/or JobSubTypes for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }

  public async deleteJobSubType(req: Request, res: Response) {
    const orgId = res.locals.orgId;
    try {
      const jobSubTypeId = parseInt(req.params?.jobSubTypeId);
      if (
        req.params === undefined ||
        req.params?.jobSubTypeId === undefined ||
        isNaN(jobSubTypeId)
      ) {
        res
          .status(400)
          .json('Bad request: jobSubTypeId is not provided or is invalid.');
        return;
      }

      await service.deleteJobSubType(orgId, jobSubTypeId);
    } catch (error) {
      console.log(
        `Could not delete JobSubType for orgID ${orgId} due to the following error: ${error}`
      );

      res.status(500).json(error);
    }
  }
}
