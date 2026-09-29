import { PrismaClient, Project, Location } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { Response } from 'express';
import { prismaMock } from '../../utils/prisma/prisma.mock';
import { req, res, next } from '../../utils/tests/express.mock';
import ProjectController from './project.controller';
import * as faker from '@faker-js/faker';
import { mockGeocoder } from '../../utils/geocoder/geocoder.mock';

describe('Project Controller', () => {
  const prisma = mockDeep<PrismaClient>();

  const mockProjects = [
    {
      id: faker.faker.datatype.uuid(),
      orgId: faker.faker.random.word(),
      customerId: faker.faker.datatype.uuid(),
      name: faker.faker.random.word(),
      isActive: true,
    },
    {
      id: faker.faker.datatype.uuid(),
      orgId: faker.faker.random.word(),
      customerId: faker.faker.datatype.uuid(),
      name: faker.faker.random.word(),
      isActive: false,
    },
  ] as Array<Project>;

  const mockLocation = {
    id: faker.faker.datatype.uuid(),
  } as Location;

  describe('getAllProjects', () => {
    it('returns active projects', async () => {
      prisma.project.findMany.mockResolvedValue(mockProjects);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new ProjectController();
      const customerId = faker.faker.datatype.uuid();

      res.locals.orgId = faker.faker.datatype.uuid();
      req.params.customerId = customerId;
      req.query.active = 'true';

      await controller.getAllProjects(req, res, next);

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            customerId,
            isDeleted: false,
            isActive: true,
          },
        })
      );
    });

    it('returns inactive projects', async () => {
      prisma.project.findMany.mockResolvedValue(mockProjects);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new ProjectController();
      const customerId = faker.faker.datatype.uuid();
      res.locals.orgId = faker.faker.datatype.uuid();
      req.params.customerId = customerId;
      req.query.active = 'false';

      await controller.getAllProjects(req, res, next);

      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            customerId,
            isDeleted: false,
            isActive: false,
          },
        })
      );
    });
  });

  describe('insertProject', () => {
    it('inserts a project and creates location', async () => {
      prisma.project.create.mockResolvedValue(mockProjects[0]);
      prisma.location.create.mockResolvedValue(mockLocation);
      mockGeocoder.mockResolvedValue([]);

      prismaMock.setPrismaClientMock(prisma);

      const mockNewProject = {
        name: 'test',
        location: {
          address: {},
        },
      } as unknown as Project;

      const controller = new ProjectController();
      const customerId = faker.faker.datatype.uuid();

      res.locals.orgId = faker.faker.datatype.uuid();
      req.params.customerId = customerId;
      req.body = mockNewProject;

      await controller.createProject(req, res, next);

      expect(prisma.location.create).toHaveBeenCalledTimes(1);
      expect(prisma.project.create).toHaveBeenCalledTimes(1);
    });

    it('inserts a project with a given location', async () => {
      prisma.project.create.mockResolvedValue(mockProjects[0]);
      prisma.location.create.mockResolvedValue(mockLocation);
      mockGeocoder.mockResolvedValue([]);

      prismaMock.setPrismaClientMock(prisma);

      const mockNewProject = {
        name: 'test',
        locationId: faker.faker.datatype.uuid(),
      } as unknown as Project;

      const controller = new ProjectController();
      const customerId = faker.faker.datatype.uuid();
      res.locals.orgId = faker.faker.datatype.uuid();
      req.params.customerId = customerId;
      req.body = mockNewProject;

      await controller.createProject(req, res, next);

      expect(prisma.location.create).toHaveBeenCalledTimes(0);
      expect(prisma.project.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateProject', () => {
    it('updates a project and its location', async () => {
      prisma.location.update.mockResolvedValue(mockLocation);
      prisma.project.update.mockResolvedValue(mockProjects[0]);
      mockGeocoder.mockResolvedValue([]);

      prismaMock.setPrismaClientMock(prisma);

      const mockUpdateProject = {
        name: 'test',
        locationId: faker.faker.datatype.uuid(),
        location: {
          address: {},
        },
      } as unknown as Project;

      const controller = new ProjectController();
      const projectId = faker.faker.datatype.uuid();
      const customerId = faker.faker.datatype.uuid();
      res.locals.orgId = faker.faker.datatype.uuid();
      req.params.customerId = customerId;
      req.params.projectId = projectId;
      req.body = mockUpdateProject;

      await controller.updateProject(req, res, next);

      expect(prisma.location.update).toHaveBeenCalledTimes(1);
      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: projectId,
          },
        })
      );
    });

    it('updates a project without', async () => {
      prisma.location.update.mockResolvedValue(mockLocation);
      prisma.project.update.mockResolvedValue(mockProjects[0]);
      mockGeocoder.mockResolvedValue([]);

      prismaMock.setPrismaClientMock(prisma);

      const mockUpdateProject = {
        name: 'test',
        locationId: faker.faker.datatype.uuid(),
      } as unknown as Project;

      const controller = new ProjectController();
      const projectId = faker.faker.datatype.uuid();
      const customerId = faker.faker.datatype.uuid();

      res.locals.orgId = faker.faker.datatype.uuid();
      req.params.customerId = customerId;
      req.params.projectId = projectId;
      req.body = mockUpdateProject;

      await controller.updateProject(req, res, next);

      expect(prisma.location.update).toHaveBeenCalledTimes(0);
      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: projectId,
          },
        })
      );
    });
  });

  describe('deleteProject', () => {
    it('soft deletes a project', async () => {
      prisma.project.update.mockResolvedValue(mockProjects[0]);

      prismaMock.setPrismaClientMock(prisma);

      const controller = new ProjectController();
      const projectId = faker.faker.datatype.uuid();

      res.locals.orgId = faker.faker.datatype.uuid();
      req.params.projectId = projectId;

      await controller.deleteProject(req, res, next);

      expect(prisma.project.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: projectId,
          },
          data: {
            isDeleted: true,
          },
        })
      );
    });
  });
});
