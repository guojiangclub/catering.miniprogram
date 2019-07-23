var app = getApp();

import {
    config,
    pageLogin,
    sandBox,
    getUrl,
    cookieStorage
} from '../../../lib/myapp.js';

Page({
    data: {
        config: '',
        token: '',
        userInfo: '',
        pointGoods: '',
        initInfo: '',
        discountInfo:'',
        schemesList:'',
        bannerList:'',
        homepage:''
    },
    onShareAppMessage(res) {
        var info = cookieStorage.get('init_info');
        let path = this.data.userInfo && this.data.userInfo.agent_code ? `/${this.route}?agent_code=${this.data.userInfo.agent_code}` : `${this.route}`;
        return {
            title: info.title,
            path: path,
            imageUrl: info.imgUrl
        }
    },
    onLoad(e) {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        let token = cookieStorage.get('user_token');
        this.setData({
            config: gbConfig,
            token: token
        })
        if (!gbConfig) {
            let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
            if (extConfig) {
                this.setData({
                    config: extConfig,
                })
            }
        }
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    screenWidth: res.screenWidth
                })
            }
        });
        this.init(e);
        this.getHomePage();
        if(token){
            this.getUserInfo();
            this.getUserDidcounts();
            this.getBalanceSchemes();
            this.getPointGoods();
            this.getBannerList();
        }
    },
    onShow(){

    },
    // 获取初始化数据
    init(e) {
        console.log('获取到的e', e);
        var token = cookieStorage.get('user_token');
        var agent_code = '';
        if (e.agent_code) {
            agent_code = e.agent_code
        }
        if (e.scene) {
            var scene = decodeURIComponent(e.scene);
            var sceneArr = scene.split(',');
            if (sceneArr.length > 0) {
                agent_code = sceneArr[1]
            }
        }
        sandBox.get({
            api: 'api/system/init'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        initInfo: res.data
                    })
                    cookieStorage.set('init_info', res.data.h5_share);
                    cookieStorage.set('service_info', res.data.online_service_data);
                    cookieStorage.set('distribution_valid_time', res.data.distribution_valid_time);
                    cookieStorage.set('init', res.data);
                    this.setCode(e);
                } else {
                    this.setCode(e);
                }
            } else {
                this.setCode(e);
            }
        })
    },
    setCode(e) {
        const timeMap = {
            y: 31536000000,
            m: 2592000000,
            d: 86400000,
            h: 3600000,
            n: 60000,
            s: 1000
        };

        // 默认有效期为7天
        var valid_time = "";
        var agent_code = e.agent_code || '';
        if (e.scene) {
            var scene = decodeURIComponent(e.scene);
            var sceneArr = scene.split(',');
            if (sceneArr.length > 0) {
                agent_code = sceneArr[0]
            }
        }
        if (!cookieStorage.get('distribution_valid_time')) {
            valid_time = 10080;
        } else {
            valid_time = cookieStorage.get('distribution_valid_time');
        }
        console.log('这个是时间', valid_time);

        let timeStamp = new Date().getTime();
        timeStamp += timeMap.n * valid_time;


        if (agent_code) {
            cookieStorage.set('agent_code', agent_code, valid_time + 'n');
            // 如果有agent_code就将这次进入的时间缓存
            cookieStorage.set('agent_code_time', timeStamp, valid_time + 'n');

            // 如果有agent_code并且有coupon_agent_code就将coupon_agent_code清除，保证agent_code为第一位
            if (cookieStorage.get('coupon_agent_code')) {
                cookieStorage.clear('coupon_agent_code')
            }
        }

    },
    jumpLink(e) {
        let link = e.currentTarget.dataset.link;
        wx.navigateTo({
            url: link
        });
    },
    jump(e){
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url:'/pages/recharge/index/index?id='+id
        });
    },
    jumpUrl(e){
        let item = e.currentTarget.dataset.item;
        if(item.blank_type == 'self'){
            wx.navigateTo({
                url:'/'+item.blank_url
            })
        } else if(item.blank_type == 'other_links'){
            wx.navigateTo({
                url:'/pages/index/webView/webView?url='+item.blank_url
            })
        } else if(item.blank_type == 'other_mini_program'){
            wx.navigateToMiniProgram({
                appId:item.blank_url
            })
        }
    },
    // 获取积分列表
    getPointGoods() {
        wx.showLoading({
            mask: true,
            content: '加载中'
        });
        sandBox.get({
            api: 'api/shitang/getPointGoods'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        pointGoods: res.data.pointGoods
                    })
                } else {
                    wx.showModal({
                        content: res.message || "获取积分商品失败",
                        showCancel: false,
                    })
                }
                wx.hideLoading();
            } else {
                wx.showModal({
                    content: "获取积分商品失败",
                    showCancel: false,
                })
                wx.hideLoading();
            }
        })
    },
    // 获取用户信息
    getUserInfo() {
        sandBox.get({
            api: 'api/shitang/me',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
            data:{
                includes:'group'
            }
        }).then(res =>{
            if(res.data.status){
                this.setData({
                    userInfo:res.data.data
                })
            } else {
                wx.showModal({
                    content: res.message || "获取数据失败",
                    showCancel: false,
                })
            }
        })
    },
    // 获取优惠券积分信息
    getUserDidcounts() {
        sandBox.get({
            api: 'api/shitang/user/discounts/info',
            header:{
                Authorization:cookieStorage.get('user_token')
            }
        }).then(res =>{
            if(res.data.status){
                this.setData({
                    discountInfo:res.data.data
                })
            } else {
                wx.showModal({
                    content: res.message || "获取数据失败",
                    showCancel: false,
                })

            }
        })
    },
    // 获取储值数据
    getBalanceSchemes() {
        sandBox.get({
            api: 'api/users/balance/schemes',
           header:{
                Authorization:cookieStorage.get('user_token')
           }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        schemesList: res.data
                    })
                } else {
                    wx.showModal({
                        content: res.message || "获取储值数据失败",
                        showCancel: false,
                    })
                }
            } else {
                wx.showModal({
                    content: "获取储值数据失败",
                    showCancel: false,
                })
            }
        })
    },
//  获取banner图
    getBannerList() {
        sandBox.get({
            api: 'api/shitang/banners/list',
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        bannerList: res.data
                    })
                } else {
                    wx.showModal({
                        content: res.message || "获取数据失败",
                        showCancel: false,
                    })
                }
            } else {
                wx.showModal({
                    content: "请求失败",
                    showCancel: false,
                })
            }
        })
    },
    //  获取banner图
    getHomePage() {
        sandBox.get({
            api: 'api/shitang/homepage/popup',
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        homepage: res.data
                    })
                } else {
                    wx.showModal({
                        content: res.message || "获取数据失败",
                        showCancel: false,
                    })
                }
            } else {
                wx.showModal({
                    content: "请求失败",
                    showCancel: false,
                })
            }
        })
    },
    jumpCode(){
        wx.navigateTo({
            url:'/pages/user/certificate/certificate'
        })
    }
});
