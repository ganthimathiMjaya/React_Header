import express, { Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { getPrismaClientForTenant } from '../utils/prisma/multiTenancyPrisma.client';

const dumpster = express.Router();

dumpster.get('/sizes', async (req: Request, res: Response) => {
  const prisma = getPrismaClientForTenant(res.locals.orgId);
  const response = await prisma.dumpsterSize.findMany();
  return res.json(response);
});

//TODO: this logic is scrap-it specific, and no longer relevant for licensees, returning empty array for now, to be removed in the future.
// Returns Dumpster Delivery/Swap Jobs in the last Two Months
dumpster.get('/recent', async (req: JWTRequest, res: Response) => {
  return res.json([]);
});

// dumpster.get('/location/:locationId', async (req: any, res) => {
//   return res.json(
//     await prisma.dumpster.findMany({
//       where: { locationId: req.params.locationId },
//     })
//   );
// });

dumpster.get('/', async (req: Request, res: Response) => {
  const prisma = getPrismaClientForTenant(res.locals.orgId);
  return res.json(await prisma.dumpster.findMany());
});

export default dumpster;
