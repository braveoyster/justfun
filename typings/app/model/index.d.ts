// This file is created by egg-ts-helper@1.29.1
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportNews from '../../../app/model/news';

declare module 'egg' {
  interface IModel {
    News: ReturnType<typeof ExportNews>;
  }
}
