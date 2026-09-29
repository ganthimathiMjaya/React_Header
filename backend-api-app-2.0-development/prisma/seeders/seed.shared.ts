import { ExtendedPrismaClient } from '../../src/utils/prisma/multiTenancyPrisma.client';

/*
Seeds intended only for multi-tenancy shared tables. Applicable and shared across ALL organizations/tenants.
*/
export default async function seedShared(prisma: ExtendedPrismaClient) {
  // Create Roles
  let roles = [
    { description: 'ADMIN' },
    { description: 'CUSTOMER' },
    { description: 'CREWMANAGER' },
    { description: 'CREWMEMBER' },
    { description: 'WEB_USER' },
  ];
  for (let i = 0; i < roles.length; i++) {
    const count = await prisma.role.count({
      where: { description: roles[i].description },
    });

    if (count > 0) {
      continue;
    }

    await prisma.role.create({
      data: roles[i],
    });
  }

  // Create Contact Types (1 - 6)
  // 1 - 6 Contacts Type
  // 7 - 9 Crew Type
  // 10 - 11 Phone/Email Type

  let contactTypes = [
    { content: 'PRIMARY', shortDesc: 'Primary Contact' },
    { content: 'SECONDARY', shortDesc: 'Secondary Contact' },
    { content: 'BILLING', shortDesc: 'Billing Contact' },
    { content: 'ACCOUNTING', shortDesc: 'Accounting Contact' },
    { content: 'CORPORATE', shortDesc: 'Corporate Contact' },
    { content: 'COMMERCIAL', shortDesc: 'Commercial Contact' },
    { content: 'PORTAJOHN', shortDesc: 'Accounting Contact' },
    { content: 'SWEEPS', shortDesc: 'Corporate Contact' },
    { content: 'DUMPSTER', shortDesc: 'Commercial Contact' },
    { content: 'PRIMARY', shortDesc: 'Primary' },
    { content: 'SECONDARY', shortDesc: 'Secondary' },
  ];
  for (let i = 0; i < contactTypes.length; i++) {
    const count = await prisma.type.count({
      where: { content: contactTypes[i].content },
    });

    if (count > 0) {
      continue;
    }

    await prisma.type.create({
      data: contactTypes[i],
    });
  }

  // Create Status (1 - 14) Job
  // 5-6 Dumpster
  let statuses = [
    { content: 'Unassigned', id: 1 },
    { content: 'Scheduled', id: 2 },
    { content: 'In Progress', id: 3 },
    { content: 'Complete', id: 4 },
    // { content: 'Ticket Sent', id: 5 }, //DEPRECATED
    // { content: 'Reported', id: 6 }, //DEPRECATED
    // { content: 'Incomplete', id: 7 }, //DEPRECATED
    // { content: 'Late', id: 8 }, //DEPRECATED
    { content: 'Needs Approval', id: 9 },
    { content: 'Cancelled', id: 10 },
    // { content: 'Available', id: 11 }, //DEPRECATED
    // { content: 'Unavailable', id: 12 }, //DEPRECATED
    // { content: 'Details Sent', id: 13 }, //DEPRECATED
    { content: 'Invoiced', id: 14 },
  ];
  //Remove all existing records to avoid conflicts with data migrations.
  await prisma.status.deleteMany();

  for (let i = 0; i < statuses.length; i++) {
    const count = await prisma.status.count({
      where: { content: statuses[i].content },
    });
    if (count > 0) {
      continue;
    }

    await prisma.status.create({
      data: statuses[i],
    });
  }

  // Create ETA Status
  const etaStatuses = ['NONE', 'ON_WAY', 'ARRIVED'];
  for (let i = 0; i < etaStatuses.length; i++) {
    const count = await prisma.etaStatus.count({
      where: { status: etaStatuses[i] },
    });

    if (count > 0) {
      continue;
    }

    await prisma.etaStatus.create({
      data: { status: etaStatuses[i] },
    });
  }

  // Create Dumpster Sizes (1 - 5)
  let sizes = [
    { content: '15 Yds' },
    { content: '20 Yds' },
    { content: '30 Yds' },
    { content: '40 Yds' },
  ];
  for (let i = 0; i < sizes.length; i++) {
    const count = await prisma.dumpsterSize.count({
      where: { content: sizes[i].content },
    });

    if (count > 0) {
      continue;
    }

    await prisma.dumpsterSize.create({
      data: sizes[i],
    });
  }

  let wasteTypes = [
    'C&D/Landfill',
    'Medical',
    'Metal',
    'Concrete',
    'Brick',
    'Recycle (LEED)',
    'Recycle (Dallas Green)',
  ];
  for (let i = 0; i < wasteTypes.length; i++) {
    const count = await prisma.wasteType.count({
      where: { description: wasteTypes[i] },
    });

    if (count > 0) {
      continue;
    }

    await prisma.wasteType.create({
      data: {
        description: wasteTypes[i],
      },
    });
  }

  let jobStatuses = [
    { code: 'PROC', desc: 'Processing', isDeleted: false },
    { code: 'COMP', desc: 'Completed', isDeleted: false },
    { code: 'PART', desc: 'Partially Failed', isDeleted: false },
    { code: 'FAIL', desc: 'Failed', isDeleted: false },
  ];
  for (let i = 0; i < jobStatuses.length; i++) {
    const count = await prisma.insightsJobStatus.count({
      where: { code: jobStatuses[i].code },
    });

    if (count > 0) {
      continue;
    }

    await prisma.insightsJobStatus.create({
      data: jobStatuses[i],
    });
  }

  let orgCustomFieldCategories = [
    { code: 'JOB', desc: 'Job', isDeleted: false },
  ];
  for (let i = 0; i < orgCustomFieldCategories.length; i++) {
    const count = await prisma.organizationCustomFieldCategory.count({
      where: { code: orgCustomFieldCategories[i].code },
    });

    if (count > 0) {
      continue;
    }

    await prisma.organizationCustomFieldCategory.create({
      data: orgCustomFieldCategories[i],
    });
  }

  let invoiceStatuses = [
    { code: 'MIS', desc: 'Missing Info', isDeleted: false },
    { code: 'RDY', desc: 'Ready', isDeleted: false },
    { code: 'CRD', desc: 'Invoice Created', isDeleted: false },
    { code: 'SNT', desc: 'Invoice Sent', isDeleted: false },
    { code: 'PAID', desc: 'Paid', isDeleted: false },
    { code: 'INA', desc: 'Inactive', isDeleted: false },
  ];
  for (let i = 0; i < invoiceStatuses.length; i++) {
    const count = await prisma.invoiceStatus.count({
      where: { code: invoiceStatuses[i].code },
    });

    if (count > 0) {
      continue;
    }

    await prisma.invoiceStatus.create({
      data: invoiceStatuses[i],
    });
  }
}
