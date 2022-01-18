// This file is created by egg-ts-helper@1.29.1
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportVerifyPassport from '../../../app/middleware/verifyPassport';

declare module 'egg' {
  interface IMiddleware {
    verifyPassport: typeof ExportVerifyPassport;
  }
}
