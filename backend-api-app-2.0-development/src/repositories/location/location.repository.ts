import { getPrismaClientForTenant } from '../../utils/prisma/multiTenancyPrisma.client';

export class LocationRepository {
  async updateNotes(orgId: string, id: string, notes: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.location.update({
      where: { id },
      data: {
        notes,
      },
    });
  }

  async findUnique(orgId: string, id: string) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.location.findUnique({
      where: {
        id,
      },
    });
  }

  async findFirstFilteredBy(
    orgId: string,
    where: {
      address: { line1: string; line2: string; city: string; zipcode: string };
    }
  ) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.location.findFirst({
      where,
    });
  }

  async create(orgId: string, body: any, geocoding: any[]) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.location.create({
      data: {
        community: body.community,
        name: `${body.address.line1} ${body.address.city}`,
        notes: body.notes,
        ...(geocoding.length > 0 && {
          latitude: geocoding[0].lat,
          longitude: geocoding[0].lng,
        }),
        ...(body.multiFamily && {
          multiFamily: body.multiFamily,
        }),
        address: {
          create: {
            line1: body.address.line1,
            line2: body.address.line2,
            state: body.address.state,
            city: body.address.city,
            zipcode: body.address.zipCode,
            active: true,
          },
        },
      },
    });
  }

  async update(orgId: string, body: any) {
    const prisma = getPrismaClientForTenant(orgId);
    return prisma.location.update({
      where: { id: body.locationId },
      data: {
        community: body.community,
        name: `${body.address.line1} ${body.address.city}`,
        notes: body.locationNotes,
        ...(body.multiFamily && {
          multiFamily: body.multiFamily,
        }),
        longitude: body.longitude,
        latitude: body.latitude,
        address: {
          update: {
            line1: body.address.line1,
            line2: body.address.line2,
            city: body.address.city,
            state: body.address.state,
            zipcode: body.address.zipcode,
          },
        },
      },
    });
  }
}
