import { CustomerRepository } from '../../repositories/customer/customer.repository';

const repository = new CustomerRepository();

export class CustomerService {
  public async getMetrics(orgId: string, customerId: string) {
    return await repository.getMetrics(orgId, customerId);
  }
}
