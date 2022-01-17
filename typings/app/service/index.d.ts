// This file is created by egg-ts-helper@1.29.1
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportTest from '../../../app/service/Test';
import ExportBaseSvc from '../../../app/service/baseSvc';
import ExportCrawlJobs from '../../../app/service/crawlJobs';
import ExportGifSina from '../../../app/service/gifSina';
import ExportNews from '../../../app/service/news';
import ExportRedis from '../../../app/service/redis';
import ExportZodiac from '../../../app/service/zodiac';
import ExportCommonMpUtils from '../../../app/service/common/mpUtils';

declare module 'egg' {
  interface IService {
    test: AutoInstanceType<typeof ExportTest>;
    baseSvc: AutoInstanceType<typeof ExportBaseSvc>;
    crawlJobs: AutoInstanceType<typeof ExportCrawlJobs>;
    gifSina: AutoInstanceType<typeof ExportGifSina>;
    news: AutoInstanceType<typeof ExportNews>;
    redis: AutoInstanceType<typeof ExportRedis>;
    zodiac: AutoInstanceType<typeof ExportZodiac>;
    common: {
      mpUtils: AutoInstanceType<typeof ExportCommonMpUtils>;
    }
  }
}
