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
        homepage:'',
        init: false,
        vipList: [
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84%205.png',
                name: '会员价'
            },
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84%205%20%281%29.png',
                name: '生日礼券'
            },
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84%205%20%282%29.png',
                name: '积分奖励'
            },
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84%205%20%283%29.png',
                name: '充值好礼'
            },
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84%205%20%284%29.png',
                name: '专属客服'
            },
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84%205%20%285%29.png',
                name: '折扣券'
            },
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84%205%20%286%29.png',
                name: '免排队'
            },
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84%205%20%287%29.png',
                name: '积分商城'
            },
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84%205%20%288%29.png',
                name: '纪念礼品'
            },
            {
                image: 'https://cdn.ibrand.cc/%E7%BB%84TT5.png',
                name: '免单支持'
            }
        ],
        isChecked: true,
        userProtocol: ''
    },
    onShareAppMessage(res) {
        var info = cookieStorage.get('init_info');
        let path = this.data.userInfo && this.data.userInfo.agent_code ? `/${this.route}?agent_code=${this.data.userInfo.agent_code}` : `${this.route}`;
        console.log(path);

        return {
            title: info.title,
            path: path,
            imageUrl: info.imgUrl
        }
    },
    onShow() {
        let token = cookieStorage.get('user_token');
        if(token){
            this.getUserInfo();
            this.getUserDidcounts();
            this.getBalanceSchemes();
            this.getBannerList();
        } else {
            this.wxLogin();
            this.gettingUserProtocol();
        }
        this.getPointGoods();
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';

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
    },
    onLoad(e) {
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    screenWidth: res.screenWidth
                })
            }
        });
        if (e.url) {
            this.setData({
                url: decodeURIComponent(e.url)
            })
        }
        this.init(e);
        // this.getHomePage();

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
                    let title = res.data.miniprogram_customer_title;
                    wx.setNavigationBarTitle({
                        title: title
                    })
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
    changeCheck() {
        this.setData({
            isChecked: !this.data.isChecked
        })
    },
    wxLogin() {
        wx.showLoading({
            title: '正在自动登录',
            mask: true
        })
        wx.login({
            success: res => {
                if (res.code) {
                    this.autoLogin(res.code);
                } else {
                    wx.showToast({
                        title: '获取code失败',
                        image: '../../../assets/image/error.png'
                    })
                }
            }
        })
    },
    // 获取手机号
    getPhoneNumber(e) {
        if (e.detail.encryptedData) {
            wx.login({
                success: res => {
                    if (res.code) {
                        this.setData({
                            code: res.code
                        }, res => {
                            this.phone(e);
                        })
                    } else {
                        wx.showModal({
                            content: " 获取code失败",
                            showCancel: false
                        })
                    }
                }
            });
            return
        }
    },
    // 获取手机号
    getPhoneNumber(e) {
        if (e.detail.encryptedData) {
            wx.login({
                success: res => {
                    if (res.code) {
                        this.setData({
                            code: res.code
                        }, res => {
                            this.phone(e);
                        })
                    } else {
                        wx.showModal({
                            content: " 获取code失败",
                            showCancel: false
                        })
                    }
                }
            });
            return
        }
    },
// 获取手机号
    phone(e) {
        wx.showLoading({
            title: '正在获取手机号',
            mask: true
        })
        sandBox.get({
            api: 'api/shitang/authorizationMobile',
            data: {
                open_type:'miniprogram',
                code: this.data.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                open_id: this.data.open_id,
                agent_code: cookieStorage.get('coupon_agent_code') || cookieStorage.get('agent_code') || '',
                agent_code_time: cookieStorage.get('agent_code_time') || '',
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        phone: res.data.mobile
                    }, () => {
                        this.submit();
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败，请重试',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: '请求失败，请重试',
                    showCancel: false
                })
            }
            wx.hideLoading();
        }).catch(rej => {
            wx.hideLoading();
            wx.showModal({
                content: '请求失败，请重试',
                showCancel: false
            })
        })
    },
    // 自动登录
    autoLogin(code) {
        sandBox.post({
            api: 'api/shitang/oauth/MiniProgramLogin',
            data: {
                code: code,
                open_type:'miniprogram',
                agent_code: cookieStorage.get('coupon_agent_code') || cookieStorage.get('agent_code') || '',
                agent_code_time: cookieStorage.get('agent_code_time') || '',
            },
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.data && res.data.open_id) {
                    this.setData({
                        open_id: res.data.open_id
                    })


                }
                // 如果接口返回token就直接登录，如果没有则弹出授权
                if (res.data.access_token) {
                    wx.hideLoading();
                    var access_token = res.data.token_type + ' ' + res.data.access_token;
                    var expires_in = res.data.expires_in || 315360000;
                    cookieStorage.set("user_token", access_token, expires_in);
                    if (this.data.url) {
                        wx.redirectTo({
                            url:"/"+this.data.url
                        })
                    } else {
                        /*wx.redirectTo({
                            url: '/pages/index/index/index'
                        })*/
                        let token = cookieStorage.get('user_token');
                        if(token){
                            this.getUserInfo();
                            this.getUserDidcounts();
                            this.getBalanceSchemes();
                            this.getBannerList();
                        }
                        this.setData({
                            token: token
                        })

                    }
                } else {
                    wx.hideLoading();
                }

            } else {
                wx.hideLoading();
                wx.showModal({
                    content:'请求失败，请重试',
                    showCancel: false,
                    success: res=>{
                        if (res.confirm || (!res.cancel && !res.confirm)) {
                            this.wxLogin();
                        }
                    }
                })
            }
        }).catch(rej => {
            wx.hideLoading();
            wx.showModal({
                content:'请求失败，请重试',
                showCancel: false,
                success: res=>{
                    if (res.confirm || (!res.cancel && !res.confirm)) {
                        this.wxLogin();
                    }
                }
            })
        })
    },
    // 获取会员章程
    gettingUserProtocol() {
        sandBox.get({
            api: 'api/shitang/GettingUserProtocol'
        }).then(res => {
            if (res.statusCode) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        userProtocol: res.data.protocol
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败，请重试',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败，请重试',
                    showCancel: false
                })
            }
        })
    },
    // 登录
    submit() {
        let message = '';
        if (!this.data.isChecked) {
            message = '请同意会员章程'
        } else if (!this.data.phone) {
            message = '请授权手机号'
        }
        if (message) {
            wx.showModal({
                content:message,
                showCancel: false,
            })
        } else {
            wx.showLoading({
                title: '正在登录',
                mask: true
            })
            wx.login({
                success: res => {
                    if (res.code) {
                        sandBox.post({
                            api: 'api/shitang/oauth/register',
                            data: {
                                mobile: this.data.phone,
                                open_id: this.data.open_id,
                                userInfo: '',
                                code: res.code,
                                agent_code: cookieStorage.get('agent_code') || ''
                            }
                        }).then(res => {
                            if (res.statusCode == 200) {
                                res = res.data;
                                if (res.status) {
                                    var access_token = res.data.token_type + ' ' + res.data.access_token;
                                    var expires_in = res.data.expires_in || 315360000;
                                    cookieStorage.set("user_token", access_token, expires_in);
                                    if (this.data.url) {
                                        wx.redirectTo({
                                            url:"/"+this.data.url
                                        })
                                    } else {
                                        /*wx.redirectTo({
                                            url: '/pages/index/index/index'
                                        })*/
                                        let token = cookieStorage.get('user_token');
                                        if(token){
                                            this.getUserInfo();
                                            this.getUserDidcounts();
                                            this.getBalanceSchemes();
                                            this.getBannerList();
                                        }
                                        this.setData({
                                            token: token
                                        })
                                    }
                                } else {
                                    wx.hideLoading();
                                    wx.showModal({
                                        content:res.message || '请求失败，请重试',
                                        showCancel: false,
                                    })
                                }
                                wx.hideLoading();
                            } else {
                                wx.hideLoading();
                                wx.showModal({
                                    content:'请求失败，请重试',
                                    showCancel: false,
                                })
                            }
                        })
                    } else {
                        wx.hideLoading();
                        wx.showToast({
                            title: '获取code失败',
                            image: '../../../assets/image/error.png'
                        })
                    }
                }
            })

        }
    },
    // 获取会员章程
    gettingUserProtocol() {
        sandBox.get({
            api: 'api/shitang/GettingUserProtocol'
        }).then(res => {
            if (res.statusCode) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        userProtocol: res.data.protocol
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败，请重试',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败，请重试',
                    showCancel: false
                })
            }
        })
    },
    jumpAgreement(e) {
        let url = this.data.userProtocol;
        if (!url) {
            wx.showModal({
                content: '地址为空',
                showCancel: false
            })
        } else {
            wx.navigateTo({
                url: '/pages/index/webView/webView?url=' + encodeURIComponent(url)
            })
        }
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


        let token = cookieStorage.get('user_token');
        if (!token) {
            /*wx.navigateTo({
                url:'/pages/user/register/register'
            })*/
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
                url:'/pages/index/webView/webView?url='+ encodeURIComponent(item.blank_url)
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
    // 更新用户信息
    bindUserInfo(e) {
        if (e.detail.encryptedData) {
            e.detail.code = this.data.code;
            this.updateUserInfo(e.detail)
        }
    },
    // 获取code
    getCode() {
        wx.login({
            success: res => {
                if (res.code) {
                    this.setData({
                        code: res.code
                    })
                }
            }
        })
    },
    // 更新用户信息
    updateUserInfo(data) {
        wx.showLoading({
            title: '更新中',
            mask: true
        })
        sandBox.get({
            api: 'api/shitang/user/bindUserInfo',
            data: data,
            header:{
                Authorization:cookieStorage.get('user_token')
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.getUserInfo();
                    setTimeout(() => {
                        wx.navigateTo({
                            url: '/pages/user/userset/userset'
                        });
                    }, 500)
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                    this.getCode();
                }
                wx.hideLoading();
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
                this.getCode();
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
                    userInfo:res.data.data,
                    init: true
                });
                if (!res.data.data.user_info_fill) {
                    this.getCode();
                }
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
