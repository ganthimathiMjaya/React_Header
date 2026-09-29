import { prismaClientBypass } from '../../utils/prisma/multiTenancyPrisma.client';
import { EtaStatus } from '@prisma/client';

export class EtaService {
  public async isOnTheWay(statusId: number): Promise<boolean> {
    const eta = await this.getEtaStatus('ON_WAY');
    return eta?.id === statusId;
  }

  public async getEtaStatus(status: string): Promise<EtaStatus | null> {
    return prismaClientBypass.etaStatus.findFirst({
      where: { status },
    });
  }
}
