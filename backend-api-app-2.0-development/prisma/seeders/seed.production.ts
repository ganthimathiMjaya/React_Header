import { prismaClientBypass } from '../../src/utils/prisma/multiTenancyPrisma.client';
import seedShared from './seed.shared';

async function main() {
  seedShared(prismaClientBypass);
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    prismaClientBypass.$disconnect();
  });
