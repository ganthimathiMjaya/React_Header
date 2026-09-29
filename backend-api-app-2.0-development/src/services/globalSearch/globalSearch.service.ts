import GlobalSearchRepository from '../../repositories/globalSearch/globalSearch.repository';

const repository = new GlobalSearchRepository();

export default class GlobalSearchService {
  public async getAllGlobalSearchRecords(orgId: string, searchTerm: string) {
    return await repository.getAllGlobalSearchRecords(orgId, searchTerm);
  }
}
