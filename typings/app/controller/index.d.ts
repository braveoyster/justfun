// This file is created by egg-ts-helper@1.29.1
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportHome from '../../../app/controller/home';
import ExportNews from '../../../app/controller/news';
import ExportSina from '../../../app/controller/sina';
import ExportZodiac from '../../../app/controller/zodiac';
import ExportBasesBaseCtrl from '../../../app/controller/bases/baseCtrl';

declare module 'egg' {
  interface IController {
    home: ExportHome;
    news: ExportNews;
    sina: ExportSina;
    zodiac: ExportZodiac;
    bases: {
      baseCtrl: ExportBasesBaseCtrl;
    }
  }
}
