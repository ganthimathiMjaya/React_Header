import { getPrismaClientForTenant } from '../../src/utils/prisma/multiTenancyPrisma.client';
import * as faker from '@faker-js/faker';
import seedDefaultOrg from './seed.defaultOrg';
import seedShared from './seed.shared';
import { appConstants } from '../../app.constants';

const prisma = getPrismaClientForTenant(appConstants.SEEDS_ORG_ID);

const NUM_CONTACTS = 100;
const NUM_LOCATIONS = 200;
const NUM_ADMIN_USERS = 8;
const NUM_CREW_USERS = 50;
const NUM_CUSTOMER_USERS = 50;

async function main() {
  function randomEnum<T>(anEnum: T): T[keyof T] {
    // @ts-ignore
    const enumValues = Object.keys(anEnum)
      .map((n) => Number.parseInt(n))
      .filter((n) => !Number.isNaN(n)) as unknown as T[keyof T][];
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    const randomEnumValue = enumValues[randomIndex];
    return randomEnumValue;
  }

  //Add all multi-tenancy shared data.
  await seedShared(prisma);

  // Create organization
  const org = await prisma.organization.findFirst({
    where: {
      id: appConstants.SEEDS_ORG_ID,
    },
  });

  if (org === null) {
    await prisma.organization.create({
      data: {
        id: appConstants.SEEDS_ORG_ID,
        name: 'test_org',
      },
    });
  }

  const { customerList, crewList } = await seedDefaultOrg(prisma);

  // Create Locations
  let locations = [];
  let createdLocations = [];
  for (let i = 0; i < NUM_LOCATIONS; i++) {
    let createdLocation = await prisma.location.create({
      data: {
        name: faker.faker.company.companyName(),
        address: {
          create: {
            line1: faker.faker.address.streetAddress(),
            line2: faker.faker.address.secondaryAddress(),
            line3: '',
            city: faker.faker.address.city(),
            county: faker.faker.address.county(),
            state: 'TX',
            zipcode: faker.faker.address.zipCode(),
            active: true,
          },
        },
        community: `${faker.faker.address.cardinalDirection()} ${faker.faker.address.city()}`,
        notes: `${faker.faker.company.catchPhraseAdjective()} ${faker.faker.company.catchPhraseNoun()}`,
        organization: faker.faker.company.companyName(),
        latitude: Number(
          faker.faker.address.latitude(33.16248357500716, 32.52407406848181)
        ),
        longitude: Number(
          faker.faker.address.longitude(-96.42418234056925, -97.44689839836536)
        ),
        active: true,
      },
    });
    createdLocations.push(createdLocation);
  }

  // Create Admin Users
  let createdUsers = [];
  for (let i = 0; i < NUM_ADMIN_USERS; i++) {
    let firstName = faker.faker.name.firstName();
    let lastName = faker.faker.name.lastName();
    let createdUser = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        role: {
          connect: {
            id: 1,
          },
        },
        active: true,
        auth_id:
          i === 0
            ? 'auth0|64ada43856a97fe95771e723'
            : `auth0|123443admin${i as unknown as string}`,
        contact: {
          create: {
            firstName: firstName,
            lastName: lastName,
            active: true,
            contactTypeId: 1,
            phone: {
              create: {
                number: faker.faker.phone.number('555-555-####'),
                typeId: 1,
                default: true,
              },
            },
            email: {
              create: {
                address: `${firstName}.${lastName}@test.com`,
                typeId: 1,
                default: true,
              },
            },
          },
        },
      },
    });
    createdUsers.push(createdUser);
  }
  for (let i = 0; i < NUM_CREW_USERS; i++) {
    let firstName = faker.faker.name.firstName();
    let lastName = faker.faker.name.lastName();
    let createdUser = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        role: {
          connect: {
            id: 3,
          },
        },
        active: true,
        auth_id: `auth0|123443crew${i as unknown as string}`,
        contact: {
          create: {
            firstName: firstName,
            lastName: lastName,
            active: true,
            contactTypeId: 1,
            phone: {
              create: {
                number: faker.faker.phone.number('555-555-####'),
                typeId: 1,
                default: true,
              },
            },
            email: {
              create: {
                address: `${firstName}.${lastName}@test.com`,
                typeId: 1,
                default: true,
              },
            },
          },
        },
      },
    });
    createdUsers.push(createdUser);
  }
  for (let i = 0; i < NUM_CUSTOMER_USERS; i++) {
    let firstName = faker.faker.name.firstName();
    let lastName = faker.faker.name.lastName();
    let createdUser = await prisma.user.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        role: {
          connect: {
            id: 2,
          },
        },
        active: true,
        auth_id: `auth0|123443customer${i as unknown as string}`,
        contact: {
          create: {
            firstName: firstName,
            lastName: lastName,
            active: true,
            contactTypeId: 1,
            phone: {
              create: {
                number: faker.faker.phone.number('555-555-####'),
                typeId: 1,
                default: true,
              },
            },
            email: {
              create: {
                address: `${firstName}.${lastName}@test.com`,
                typeId: 1,
                default: true,
              },
            },
          },
        },
      },
    });
    createdUsers.push(createdUser);
  }

  let testUsersIndex = 0;
  const testCustomerUsers = [
    {
      customerIndex: 0, // Custom Type
      authId: 'auth0|64adaaa829f69be25e42c5b6', // testuser2
    },
    {
      customerIndex: 2, // Production Type
      authId: 'auth0|62a0b85b7a2d1ae43eab469e', // testuser4
    },
  ];

  let testCrewIndex = 0;
  const testCrewUsers = [
    {
      crewIndex: 2, // Scrap-It Dumpsters
      authId: 'auth0|64b17f76e6fd28952ae15bbc', // testuser3
    },
    {
      crewIndex: 4, // A&A Professional Cleaning
      authId: 'auth0|62a0b8c30be683a86c0bb3d5', // testuser5
    },
  ];
  for (let i = 0; i < createdUsers.length; i++) {
    await prisma.userOrganization.create({
      data: {
        userId: createdUsers[i].id,
      },
    });

    if (createdUsers[i].roleId === 1) {
      await prisma.admin.create({
        data: {
          userId: createdUsers[i].id,
          admin_level: 1,
        },
      });
    } else if (createdUsers[i].roleId === 2) {
      let customerIndex = Math.floor(
        Math.random() * (customerList.length - 1 + 1)
      );
      let authId = null;
      if (testUsersIndex < testCustomerUsers.length) {
        customerIndex = testCustomerUsers[testUsersIndex].customerIndex;
        authId = testCustomerUsers[testUsersIndex].authId;
        testUsersIndex++;
      }

      await prisma.user.update({
        where: {
          id: Number(createdUsers[i].id),
        },
        data: {
          customerUser: {
            create: {
              customerId: customerList[customerIndex].id,
              userId: Number(createdUsers[i].id),
            },
          },
          ...(authId && { auth_id: authId }),
        },
      });
    } else if (createdUsers[i].roleId === 3) {
      let crewIndex = Math.floor(Math.random() * (crewList.length - 1 + 1));
      let authId = null;
      if (testCrewIndex < testCrewUsers.length) {
        crewIndex = testCrewUsers[testCrewIndex].crewIndex;
        authId = testCrewUsers[testCrewIndex].authId;
        testCrewIndex++;
      }

      await prisma.user.update({
        where: {
          id: Number(createdUsers[i].id),
        },
        data: {
          crewUser: {
            create: {
              crewId: crewList[crewIndex].id,
              userId: Number(createdUsers[i].id),
            },
          },
          ...(authId && { auth_id: authId }),
        },
      });
    }
  }

  // Create More Addresses
  let addresses = [];
  for (let i = 0; i < NUM_CONTACTS; i++) {
    addresses.push({
      line1: faker.faker.address.streetAddress(),
      line2: faker.faker.address.secondaryAddress(),
      line3: '',
      city: faker.faker.address.city(),
      county: faker.faker.address.county(),
      state: 'TX',
      zipcode: faker.faker.address.zipCode(),
      active: true,
    });
  }
  for (let i = 0; i < addresses.length; i++) {
    await prisma.address.create({
      data: addresses[i],
    });
  }
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
