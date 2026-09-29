import newCrews from '../../src/data/crews';
import newCustomers from '../../src/data/customers';
import disposalSites from '../../src/data/disposalSites';
import { ExtendedPrismaClient } from '../../src/utils/prisma/multiTenancyPrisma.client';

/*
Seeds intended only for multi-tenancy default tenant (scrap-it). Applicable ONLY to this tenant.
*/
export default async function seedDefaultOrg(prisma: ExtendedPrismaClient) {
  // Create Job Types
  //

  // Create Admin Users
  const user = await prisma.user.create({
    data: {
      firstName: 'Garrett',
      lastName: 'King',
      role: {
        connect: {
          id: 1,
        },
      },
      active: true,
      auth_id: 'auth0|633c45700fe9d4cd3a4d3ede',
      contact: {
        create: {
          firstName: 'Garrett',
          lastName: 'King',
          active: true,
          contactTypeId: 1,
          phone: {
            create: {
              number: '',
              typeId: 1,
              default: true,
            },
          },
          email: {
            create: {
              address: `garrett@scrap-it.com`,
              typeId: 1,
              default: true,
            },
          },
        },
      },
    },
  });

  let customerList: any[] = [];
  let crewList: any[] = [];

  for (let i = 0; i < newCustomers.length; i++) {
    let createdCustomer = await prisma.customer.create({
      data: {
        name: newCustomers[i].name,
        bulkComplete: true,
        active: true,
        workOrderNotes: '',
        customerBillingNotes: '',
        terms: 30,
        billingAddressLine1: newCustomers[i].location.address.line1,
        billingCity: newCustomers[i].location.address.city,
        billingState: newCustomers[i].location.address.state,
        billingZipcode: newCustomers[i].location.address.zipcode,
        billingEmail: 'test@test.com',
        billingPhone: '1234567890',
        createdBy: {
          connect: {
            id: user.id,
          },
        },
        location: {
          create: {
            name: newCustomers[i].name,
            latitude: newCustomers[i].location.lat,
            longitude: newCustomers[i].location.long,
            address: {
              create: {
                line1: newCustomers[i].location.address.line1,
                line2: newCustomers[i].location.address.line2,
                city: newCustomers[i].location.address.city,
                zipcode: newCustomers[i].location.address.zipcode,
                state: newCustomers[i].location.address.state,
                active: true,
              },
            },
          },
        },
      },
    });
    customerList.push(createdCustomer);
  }

  for (let i = 0; i < newCrews.length; i++) {
    let createdCrew = await prisma.crew.create({
      data: {
        name: newCrews[i].name,
        type: {
          connect: {
            id: 7,
          },
        },
        createdBy: {
          connect: {
            id: user.id,
          },
        },
        active: true,
        capacity: newCrews[i].capacity,
        location: {
          create: {
            name: newCrews[i].name,
            latitude: newCrews[i].location.lat,
            longitude: newCrews[i].location.long,
            address: {
              create: {
                line1: newCrews[i].location.address.line1,
                line2: newCrews[i].location.address.line2,
                city: newCrews[i].location.address.city,
                zipcode: newCrews[i].location.address.zipcode,
                state: newCrews[i].location.address.state,
                active: true,
              },
            },
          },
        },
      },
    });
    crewList.push(createdCrew);
  }

  // Disposal Sites
  let createdDisposalSites: any = [];
  for (let i = 0; i < disposalSites.length; i++) {
    let createdDisposalSite = await prisma.disposalSite.create({
      data: {
        location: {
          create: {
            name: disposalSites[i].name,
            latitude: disposalSites[i].location.lat,
            longitude: disposalSites[i].location.long,
            address: {
              create: {
                line1: disposalSites[i].location.address.line1,
                line2: disposalSites[i].location.address.line2,
                city: disposalSites[i].location.address.city,
                zipcode: disposalSites[i].location.address.zipcode,
                state: disposalSites[i].location.address.state,
                active: true,
              },
            },
          },
        },
        greenFlag: true,
      },
    });
    createdDisposalSites.push(createdDisposalSite);
  }

  return { customerList, crewList };
}
