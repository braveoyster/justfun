import BaseService from './baseSvc';

export default class CrawlJobs extends BaseService {
  async create(items: any) {

    const ret = await this.bulkCreateResources('CrawlJobs', items);
    return ret;
  }

  async update(id, updates) {
    const ret = await this.updateResource('CrawlJobs', updates, {id});
    return ret;
  }
}
