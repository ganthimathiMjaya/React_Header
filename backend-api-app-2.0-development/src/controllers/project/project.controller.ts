import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../../services/project/project.service';

const projectService = new ProjectService();

export default class ProjectController {
  public async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getAllProjects(
        res.locals.orgId,
        req.params?.customerId,
        req.query?.active === 'true'
      );
      return res.status(200).json(project);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in ProjectController.getAllProjects',
      });
    }
  }

  public async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.createProject(
        res.locals.orgId,
        req.params?.customerId,
        req.body
      );
      return res.status(200).json(project);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in ProjectController.createProject',
      });
    }
  }

  public async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.updateProject(
        res.locals.orgId,
        req.params?.customerId,
        req.params?.projectId,
        req.body
      );
      return res.status(200).json(project);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in ProjectController.updateProject',
      });
    }
  }

  public async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.deleteProject(
        res.locals.orgId,
        req.params?.projectId
      );
      return res.status(200).json(project);
    } catch (error) {
      next({
        error,
        message: `Error: ${error}`,
        errorPath: 'Error in ProjectController.deleteProject',
      });
    }
  }
}
