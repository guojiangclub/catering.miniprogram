/**
 * Created by admin on 2017/8/30.
 */
// http://admin.dev.tnf.ibrand.cc/

/*
* 1.每次发布项目前都需要修改logo，url以及name。
* 2.logo对应登录页面的logo
* 3.url对应线上请求的url
* 4.name对应登录页面的xxx用户协议以及页面中的部分判断  //mier，uto的是英文
* */

export default  {

    BRAND: {
        name: 'jiangnan',
        logo: 'https://wx.qlogo.cn/mmhead/Q3auHgzwzM6OM5hb6yiap47BtficrcdCy0qviaOvpeYALPVBIdRzsgLxQ/0',
        cache: ''
    },
    GLOBAL: {

        // https://admin-dev.ibrand.cc/
        // https://miniprogram-proxy.ibrand.cc/  第三方平台请求接口
        // https://jiangnanriji.kelai.tech/江南
        // https://crm.kelai.tech/ 氪来
        // https://shitang-admin.ibrand.cc/  仕堂
        baseUrl: process.env.NODE_ENV === 'development' ? 'https://admin-dev.ibrand.cc/' : 'https://shitang-admin.ibrand.cc/', // 运行时自动替换变量
        client_id: '2',
        client_secret: 'sL8ybYt3DpoxfilP5I45goZ0bsLHEcKFHF9bbnVY',
    },
    PACKAGES: {
        activity: false,
        autoLogin: false,  // 是否自动登录（优仙姿专用）
        author: true,   // 是否显示技术支持
        isTab: true    // 购物车以及分类是否为tab页面
    },
    VERSION:'1.0.0'

}