import { ProjectRepository } from '../../repositories/project/project.repository';
import { LocationRepository } from '../../repositories/location/location.repository';
import { Project } from '@prisma/client';
import { generateGeoLocation } from '../../utils/geocoder/geocoder.client';

const projectRepository = new ProjectRepository();
const locationRepository = new LocationRepository();

export class ProjectService {
  public async getProject(
    orgId: string,
    projectId: string
  ): Promise<Project | null> {
    return projectRepository.findUnique(orgId, projectId);
  }

  public async getAllProjects(
    orgId: string,
    customerId: string,
    active: boolean
  ): Promise<Array<Project>> {
    return projectRepository.getAll(orgId, customerId, active);
  }

  public async createProject(
    orgId: string,
    customerId: string,
    data: any
  ): Promise<Project> {
    if (!data.locationId && data.location) {
      // This seems bad, the returned object from GETting an address has lowercase zipcode, not zipCode, but create requires zipCode - Danielle
      if (!data.location.address.zipCode) {
        data.location.address.zipCode = data.location.address.zipcode;
      }
      if (!data.location.address.zipcode) {
        data.location.address.zipcode = data.location.address.zipCode;
      }
      const geocode = await generateGeoLocation(data.location.address);
      const result = await locationRepository.create(
        orgId,
        data.location,
        geocode
      );
      data.location = { connect: { id: result.id } };
      data.customer = { connect: { id: customerId } };
      data.customerId = undefined;
    } else {
      // locationId takes priority over a supplied location - Danielle
      data.location = undefined;
    }

    if (data.primaryContactId) {
      data.primaryContact = { connect: { id: data.primaryContactId } };
    }
    data.primaryContactId = undefined;

    if (data.secondaryContactId) {
      data.secondaryContact = { connect: { id: data.secondaryContactId } };
    }
    data.secondaryContactId = undefined;

    if (!data.name && data.location && data.location.address) {
      data.name = data.location.address.line1;
    }
    return projectRepository.create(orgId, data);
  }

  public async updateProject(
    orgId: string,
    customerId: string,
    projectId: string,
    data: any
  ): Promise<Project> {
    if (data.location) {
      data.location.locationId = data.location.id;
      const geocode = await generateGeoLocation(data.location.address);
      const geocodedLocation = {
        ...data.location,
        ...(geocode.length > 0 && {
          latitude: geocode[0].lat,
          longitude: geocode[0].lng,
        }),
      };
      await locationRepository.update(orgId, geocodedLocation);
      data.location = undefined;
    }
    //remove customerId from payload. Customer cannot be changed.
    delete data['customerId'];

    //Set contacts
    if (data.primaryContactId) {
      data.primaryContact = { connect: { id: data.primaryContactId } };
    } else {
      data.primaryContact = { disconnect: true };
    }
    data.primaryContactId = undefined;

    if (data.secondaryContactId) {
      data.secondaryContact = { connect: { id: data.secondaryContactId } };
    } else {
      data.secondaryContact = { disconnect: true };
    }
    data.secondaryContactId = undefined;
    return projectRepository.update(orgId, customerId, projectId, data);
  }

  public async deleteProject(orgId: string, projectId: string) {
    await projectRepository.delete(orgId, projectId);
  }
}
