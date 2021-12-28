import { Service } from 'egg';

/**
 * Test Service
 */
export default class News extends Service {

  /**
   * sayHi to you
   * @param name - your name
   */
  public async index() {
    const results = [
      { text: "假装喝水", url: "https://tva1.sinaimg.cn/large/005OuxLily1gxp4jznndfg30b80ayu0x.gif" },
      { text: "有理", url: "https://tva1.sinaimg.cn/large/005OuxLily1gxp4jahcvrg30820d9b2g.gif" },
      { text: "出了名得快", url: "https://tva1.sinaimg.cn/large/005OuxLily1gxp4j4vj7wg30bx0hru14.gif" },
      { text: "不用行此大礼", url: "https://tva1.sinaimg.cn/large/005OuxLily1gxp4gw4so6g306p0byx6v.gif" },
      { text: "心诚则灵", url: "https://tva1.sinaimg.cn/large/005OuxLily1gxp4gpz0h1g309m0a0qvf.gif" },
      { text: "擦", url: "https://tva1.sinaimg.cn/large/005OuxLily1gxnkdq0hy0g306c0b8hdz.gif" },
      { text: "厉害了", url: "https://tva1.sinaimg.cn/large/005OuxLily1gxnkdomghpg30a00hqu14.gif" },
      { text: "狗才喝的可口可乐和狗都不喝的百事", url: "https://tva1.sinaimg.cn/large/7dd42f11ly1gxpv53pyiig205408gu0y.gif" },
      { text: "大黄蜂还是干不过擎天柱啊", url: "https://tva4.sinaimg.cn/large/7dd42f11ly1gxpv4rb7jlg204u049b2a.gif" },
      { text: "太贴心了，特意关着免得乱跑", url: "https://tva1.sinaimg.cn/large/7dd42f11ly1gxpsl6mxj8g209s080qsk.gif" },
      { text: "第一个救人的哥们内心：卧槽这么重", url: "https://tva3.sinaimg.cn/large/0080ZTByly1gxpdjofpdzg307s08c7wk.gif" },
      { text: "铁扫帚", url: "https://tva2.sinaimg.cn/large/0080ZTByly1gxpdj9aobsg307s07skjo.gif" },
      { text: "咕涌大赛", url: "https://tva2.sinaimg.cn/large/7dd42f11ly1gxpdfm0v0rg206j08wkjs.gif" },
      { text: "站那边的人也是叼，一动不动", url: "https://tva3.sinaimg.cn/large/7dd42f11ly1gxpddiw3ozg206y0cc4qs.gif" },
      { text: "感觉是个有危险的游戏", url: "https://tvax2.sinaimg.cn/large/007kPYPngy1gxpaxtt8pzg305k05j1kx.gif" },
      { text: "好了，你们三个知道怎么开上来了吧", url: "https://tva3.sinaimg.cn/large/007kPYPngy1gxpb38yfebg3082064npe.gif" },
      { text: "移动被窝", url: "https://tvax1.sinaimg.cn/large/007kPYPngy1gxpb3up05pg305k09we82.gif" },
      { text: "大胆想法排队处", url: "https://tvax3.sinaimg.cn/large/007kPYPngy1gxpb5fj8rjg307007yhdt.gif" },
      { text: "为什么付一样的钱，他能多玩一个项目？", url: "https://tva1.sinaimg.cn/large/007kPYPngy1gxpb8zyga8g305k09wkjm.gif" },
      { text: "凌霄宝殿特效", url: "https://tva1.sinaimg.cn/large/007kPYPngy1gxpb9d94c3g30ch0681l4.gif" },
      { text: "什么叫勇字当头啊", url: "https://tvax2.sinaimg.cn/large/007kPYPngy1gxn1v5tx91g30b4069qv7.gif" },
      { text: "喜欢上了认真准备食材，精心烹制最后做出来一坨屎的感觉，就像我的人生。", url: "https://tvax3.sinaimg.cn/large/007kPYPngy1gxn1w2zmkkg306j085npd.gif" },
      { text: "一个传染俩", url: "https://tvax4.sinaimg.cn/large/007kPYPngy1gxn1vtmzrvg305m09z4qx.gif" },
      { text: "非人的友谊真的存在吗？", url: "https://tva1.sinaimg.cn/large/001Hf62Dly1gxo8torj2jg607e0dce8602.gif" }];

    return { results };
  }
}
