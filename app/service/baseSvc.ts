/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import { Service } from 'egg';
import * as moment from 'moment';
import * as _ from 'lodash';
import { unitOfTime } from 'moment';
import { Context, IModel } from '../../typings/app';
import RedisService from './redis';
import { Response } from '../response';

interface QueryParamsInterface {
  title: string; // 取值key
  model?: string; // 指定model源
  key?: string; // 查询数据库对应字段的名称  默认为title
  isJson?: boolean; // 是否需要转换json
  objKey?: string; // 对象取值key
  isFuzzy?: boolean; // 是否模糊查询
  time?: boolean; // 是否为时间筛选
  unitOfTime?: unitOfTime.StartOf;
  timeRight?: boolean; // 时间右闭合
  default?: any;
}

export default class BaseService extends Service {
  private model: IModel;

  constructor(ctx: Context, model: any) {
    super(ctx);
    this.model = model;
  }

  public async verifySmsCode(mobile, code: string) {
    if (mobile * 1) {
      if (!/^1[3456789]\d{9}$/.test(mobile)) {
        throw '验证码错误';
      }
    }

    const isTest = this.config.testUser.mobiles.includes(mobile) && code === this.config.testUser.code;
    if (!isTest) {
      const redis = new RedisService(this.ctx);
      const code_key = this.generate_code_key(mobile);
      const existCode = await redis.get(code_key);

      if (!existCode) {
        throw '验证码过期';
      }
      // 验证 验证码的正确性
      const isSame = _.isEqual(existCode, code);
      if (!isSame) {
        throw '验证码错误';
      }
      await redis.del(code_key);
    }
  }

  // 生成手机验证码存储KEY
  public generate_code_key(mobile: string) {
    return `sms_verf_code_${mobile}`;
  }

  // 解析日期区间条件
  private destructDateRangeCondition(dateRange: string, unit: unitOfTime.StartOf = 'day'): object | null {
    dateRange = dateRange.trim();
    if (!dateRange) return null;

    const { app: { Sequelize: { Op } } } = this;

    if (dateRange.includes('to')) {
      const sptVal = dateRange.split('to');
      if (sptVal.length === 2) {
        return {
          [Op.lte]: moment(`20${sptVal[1].trim()}`).endOf(unit).format('yyyy-MM-DD HH:mm:ss'),
          [Op.gt]: moment(`20${sptVal[0].trim()}`).startOf(unit).format('yyyy-MM-DD HH:mm:ss'),
        };
      }
    }

    const dtStart = moment(`20${dateRange}`);
    const dtEnd = moment(`20${dateRange}`).add(1, 'days');
    if (!dtStart.isValid()) return null;

    return {
      [Op.lte]: dtEnd.endOf(unit).format('yyyy-MM-DD HH:mm:ss'),
      [Op.gt]: dtStart.startOf(unit).format('yyyy-MM-DD HH:mm:ss'),
    };
  }

  /*
  * 格式化查询参数
  * @param keys Array 需要过滤的字段 默认元素为string，支持QueryParamsInterface
  * @return Object 格式化好的查询条件
  *   {
  *     whereFilters: first model where,
  *     options: first model options,
  *     [model name]: appoint model where
  *   }
  * */
  public formatQueryParams(keys: (string | QueryParamsInterface)[], query?: any) {
    const { ctx, app } = this;
    const { Op } = app.Sequelize;
    if (!query) {
      query = ctx.query;
    }
    const results: any = {
      whereFilters: { is_deleted: 0 },
    };
    const defaultTimeKey = ['created_at', 'updated_at'];
    const order = query._sort && query._sort.split(':');
    const orderWhite = ['DESC', 'ASC'];
    const options = {
      limit: parseInt(query._limit) * 1 || 20,
      offset: parseInt(query._start) * 1 || 0,
      // order: [[col('updated_at'), 'DESC']],
      order: [['updated_at', 'DESC']],
      distinct: true,
    };
    if (order && order[1] && orderWhite.includes(order[1])) {
      // order[0] = col(order[0]);
      Object.assign(options, { order: [order] });
    }

    keys.forEach((item) => {
      if (typeof item === 'string') {
        let val: any = query[item];

        if (val === undefined || val === null) return false;
        if (defaultTimeKey.includes(item)) {
          const ret = this.destructDateRangeCondition(val);
          if (ret) {
            val = ret;
          }
        }
        results.whereFilters[item] = val;
      } else {
        if (!item.title) return false;
        let val: any = query[item.title];

        if (val === undefined || val === null) {
          if (item.default !== undefined) {
            val = item.default;
          } else {
            return false;
          }
        }
        if (defaultTimeKey.includes(item.key || item.title) || item.time) {
          const ret = this.destructDateRangeCondition(val, item.unitOfTime);
          if (ret) {
            val = ret;
          }

          if (item.timeRight) {
            const gtDate = new Date(val[Op.gt]);
            val[Op.gt] = new Date(gtDate.getTime() + 1000 * 60 * 60 * 24);
          }
        } else {
          if (item.isJson) {
            try {
              val = JSON.parse(val);
            } catch (e) {
              // ...
            }
          }

          if (Array.isArray(val)) {
            if (!val.length) return false;
            if (typeof val[0] === 'object') val = val.map((k) => k[item.objKey || 'id']);
          }

          if (Object.prototype.toString.apply(val) === '[object Object]') {
            val = val[item.objKey || 'name'];
          }

          if (item.isFuzzy) {
            val = {
              [Op.like]: `%${val}%`,
            };
          }
        }

        if (item.model) {
          if (!results[item.model]) results[item.model] = {};

          results[item.model][item.key || item.title] = val;
          return false;
        }

        results.whereFilters[item.key || item.title] = val;
      }
    });

    return {
      options,
      ...results,
    };
  }

  /*
  * 结构出日期查询区间，附加到查询条件上
  * @param field String 查询字段
  * @param where Object 查询条件对象
  * @return null
  * */
  protected destructDateRange(field: string, where: any) {
    const { ctx, app } = this;
    const { Op } = app.Sequelize;
    const rangeField = ctx.query[field];

    if (rangeField) {
      const parts = rangeField.split(' to ');
      const from = `20${parts[0]}`;
      const to = `20${parts[1]}`;

      where[field] = {};
      where[field][Op.gt] = new Date(from);
      where[field][Op.lt] = new Date(to);
    }
  }

  /*
  * 操作权限验证
  * @param key String 当前操作的key
  * @return Boolean 是否可操作
  * */
  public operateVerify(key: string) {
    const { ctx } = this;
    const { permissions } = ctx;
    const findPer = permissions.find((f: any) => f.key === key);

    return !!findPer;
  }

  /**
  * 获取当前用户的数据权限(roles, departments)
  * @return object data permissions
  * */
  public _dataPerm() {
    const { depts: allDepts, roles } = this.ctx.user;
    const depts = allDepts.filter((d) => d.enabled);

    return {
      depts,
      roles,
      hasManager: depts.some((dp) => dp.is_manager),
      noDepts: depts.length === 0,
      onlyOneDept: depts.length === 1,
    };
  }

  /**
  * 生成根据用户所属部门的数据权限
  * @param { boolean } includeUid - 是否包含user_id筛选项
  * @param { string } uidField - user_id字段名
  * @param { string } dpField - boolean department no字段名
  * */
  public _genDataPermFilters(includeUid: boolean = true, uidField: string = 'user_id', dpField: string = 'dept_no') {
    if (this.ctx.user.is_super) return {};
    const dp = this._dataPerm();
    const { id: uid } = this.ctx.user;
    const _uid = typeof uid == 'string' ? (this.app as any).hashids.decode(uid)[0] : uid;
    const uidFilterPart = {
      [uidField]: _uid,
    };

    // 没有归属部门 或 全部所属部门都没有管理员权限 只查自己uid的数据
    if (dp.noDepts || !dp.hasManager) {
      return uidFilterPart;
    }

    const { Op } = this.app.Sequelize;
    const dpFilters = {};
    if (dp.onlyOneDept && !includeUid) { // 只有一个管理部门 且 不包含user_id讲直接返回单条like条件
      return {
        [dpField]: {
          [Op.like]: `${dp.depts[0].dept_no}%`,
        },
      };
    }

    // 生成有管理员权限的所有部门的or条件
    const parts = dp.depts.filter((d) => d.is_manager).map((d) => ({
      [dpField]: {
        [Op.like]: `${d.dept_no}%`,
      },
    }));

    dpFilters[Op.or] = parts;

    // 如需包含user_id项，加到[Op.or]条件中
    if (includeUid) {
      dpFilters[Op.or].push(uidFilterPart);
    }

    return dpFilters;
  }

  /*
  * 数据权限验证
  * @param model String model名称
  * @param id Number 验证的数据id
  * @return Boolean 是否可操作
  * */
  public async dataVerify(model: string, id: number) {
    const { ctx } = this as any;
    const { organization_id } = ctx.user;
    // 获取用户的机构权限
    const { organization } = ctx.user;

    // 超级管理员和总部机构可以看全部数据
    if (ctx.user.is_super) return true;
    if (!organization) return false;

    if (organization.type === 'headquarters') return true;

    const findOne = await ctx.model[model].findOne({
      where: {
        id,
        organization_id,
      },
    });

    return !!findOne;
  }

  /*
  * 阿里云对象存储上传
  * @param storageType String public/private 标识是上传私有bucket还是公共bucket
  * @param fileName String 文件名称
  * @param stream 文件流或文件地址
  * @return 上传信息
  * */
  public async putOSS(storageType: string, fileName: string, stream) {
    const { ctx } = this;
    const oss = await ctx.oss.get(`${storageType}OSS`);
    const options = { 'Content-Length': 1024 * 1024 * 1024 };
    return oss.put(fileName, stream, options);
  }

  /*
  * 阿里云对象存储获取
  * @param storageType String public/private 标识是上传私有bucket还是公共bucket
  * @param fileName String 文件名称
  * @return 获取的文件信息
  * */
  public async getOSS(storageType: string, fileName: string) {
    const { ctx } = this;
    const oss = await ctx.oss.get(`${storageType}OSS`);

    try {
      return oss.get(fileName);
    } catch (e) {
      return oss.get(`/converts_videos/${fileName}`);
    }
  }

  public async findResource(model: string, where?: object) {
    return this.findResources(model, where);
  }

  public async findResources(model: string, where?: object, isAll?) {
    const { ctx } = this;

    return ctx.model[model][isAll ? 'findAll' : 'findOne']({
      where,
    });
  }

  public async updateResource(model: string, params: object, where: object, transaction?) {
    const { ctx } = this;

    return ctx.model[model].update(params, {
      where,
      transaction,
    });
  }

  public async createResource(model: string, params: object, transaction?, fields?: string[]) {
    const { ctx } = this;

    return ctx.model[model].create(params, {
      transaction,
      fields,
    });
  }

  public async bulkCreateResources(model: string, params: object[], options?, transaction?) {
    const { ctx } = this;

    return ctx.model[model].bulkCreate(params, {
      ...options,
      transaction,
    });
  }

  public async bulkCreateOrUpdateResources(model: string, params: object[], transaction, options?) {
    const { ctx } = this;
    const update = params.filter((f: any) => f.id);
    const create = params.filter((f: any) => !f.id);

    await ctx.model[model].bulkCreate(update, {
      ...options,
      transaction,
    });

    return ctx.model[model].bulkCreate(create, {
      transaction,
    });
  }

  public async queryByPageIndex(keys: (string | QueryParamsInterface)[], model: any, where?: any, options?: any) {
    const filter = this.formatQueryParams(keys);
    const ps = filter.options.limit;
    const pi = Math.floor(filter.options.offset / ps);
    const result = await model.findAndCountAll({
      where: {
        ...filter.whereFilters,
        is_deleted: 0,
        ...where,
      },
      distinct: true,
      ...filter.options,
      ...options,
    });

    return this.convertToResponse(result.rows, result.count, pi, ps);
  }

  public async queryById(mode: any, id: any, options: any) {
    const entity = await mode.findById(id, options);
    return this.convertToResponse(entity);
  }

  public async deleteById(id: any): Promise<any> {
    return this.model.update({ is_deleted: 1 }, { where: { id } });
  }

  public async deleteByWhere(where: any, model: any) {
    await model.update({ is_deleted: 1 }, { where });
    return true;
  }

  public async updateToDiscarded(model: any, conditions: any, transaction?) {
    let curModel = model;
    if (typeof model === 'string') {
      curModel = this.ctx.model[model];
    }
    return curModel.update({ is_deleted: 1 }, { where: conditions, transaction });
  }

  protected async convertToResponse(entities: any[] | any, count?: number, pi?: number, ps?: number) {
    return new Response(entities, count, pi, ps);
  }

  // hash 解码
  public hashDecode(val) {
    const { app } = this;
    const decodeVal = (app as any).hashids.decode(val);

    if (decodeVal && decodeVal[0]) return decodeVal[0];
  }

  // hash 加密
  public hashEncode(val) {
    const { app } = this;

    return (app as any).hashids.encode(val);
  }

  public async ossURLAuthorize(name) {
    const { ctx } = this;
    const oss = await ctx.oss.get('privateOSS');
    let exist = false;

    try {
      exist = await oss.get(`/converts_videos/${name}`);

      ctx.logger.info('从converts_videos里获取文件存在 ', exist);
    } catch (e) {
      // 当前文件并未转码
      ctx.logger.warn('文件未转码:', name, e);
    }

    let signPath = name;
    if (exist) {
      signPath = `converts_videos/${name}`;
    } else {
      try {
        exist = await oss.get(name);
        ctx.logger.info('从根目录里获取文件存在 ', exist);
      } catch (e) {
        // 当前文件并未转码
        ctx.logger.warn('文件未转码 根目录:', name);
        return null;
      }
    }

    try {
      const signatureUrl = oss.signatureUrl(`/${signPath}`);

      ctx.logger.info('signatureUrl ... ', signatureUrl);
      if (signatureUrl) {
        return signatureUrl.replace('-internal', '');
      }
      throw new Error('未能获取到加密地址');
    } catch (e) { // 如有未转码尝试获取未转之前的地址
      ctx.logger.error(e);
      return false;
    }
  }
}
