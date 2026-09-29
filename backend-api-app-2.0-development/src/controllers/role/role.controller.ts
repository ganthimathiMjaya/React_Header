import { prismaClientBypass } from '../../utils/prisma/multiTenancyPrisma.client';

export default class RoleController {
  public async getRoles() {
    const roles = await prismaClientBypass.role.findMany();

    return roles;
  }
}
