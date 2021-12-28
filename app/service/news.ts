import BaseService from './baseSvc';

/**
 * Test Service
 */
export default class News extends BaseService {
  async find() {
    const { app: { model } } = this;
    const { whereFilters, options } = this.formatQueryParams([
    ]);

    const resp = await model.News.findAndCountAll({
      where: {
        ...whereFilters,
      },
      ...options,
      order: [['created_at', 'DESC']],
    });

    return {
      results: resp.rows,
      length: resp.rows.length,
      total: resp.count,
    };
  }
}
