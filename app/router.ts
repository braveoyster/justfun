import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  // router.get('/', controller.home.index);

  router.get('/news', controller.news.index);

  router.get('/crawl_jobs/dis', controller.news.discoverLatest);
  router.get('/crawl_jobs/sync', controller.news.syncLatest);

  router.get('/crawl_jobs/remove/:startts', controller.news.removeListRecords);
  router.get('/crawl_jobs/remove_detail/:startts', controller.news.removeDetailRecords);
};
