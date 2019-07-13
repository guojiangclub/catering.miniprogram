import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        code: '',
        url: '',
        logo: '',
        author: config.PACKAGES.author,
        config: ''
    },
    onLoad(e){
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
        if (e.url) {
            this.setData({
                url: decodeURIComponent(e.url)
            })
        }
        if (e.shop_id) {
            cookieStorage.set('shop_id', e.shop_id);
        }
    },
    onShow() {
        var token=cookieStorage.get('user_token');
        this.setData({
            token:token
        });

        var initInfo = cookieStorage.get('init');
        if (initInfo && initInfo.shop_show_logo) {
            this.setData({
                logo: initInfo.shop_show_logo
            })
        }

        if(token){
            wx.switchTab({
                url: '/pages/user/personal/personal'
            })
        } else {
            this.wxLogin();
        }
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
    jumpLogin(){
        if (this.data.url) {
            wx.navigateTo({
                url: '/pages/user/loginType/loginType?url=' + encodeURIComponent(this.data.url) + '&open_id=' + this.data.open_id
            })
        } else {
            wx.navigateTo({
                url: '/pages/user/loginType/loginType?open_id=' + this.data.open_id
            })
        }

    },
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
            console.log(this.data.code);
            return
        } else {
            this.jumpLogin();
        }
    },

    phone(e) {
        wx.showLoading({
            title: '正在登录',
            mask: true
        })
        sandBox.post({
            api: 'api/v2/oauth/miniprogram/mobile',
            data: {
                open_type:'miniprogram',
                code: this.data.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                open_id: this.data.open_id,
                shop_id: cookieStorage.get('shop_id') || '',
                agent_code: cookieStorage.get('coupon_agent_code') || cookieStorage.get('agent_code') || '',
                clerk_id: cookieStorage.get('clerk_id') || '',
                agent_code_time: cookieStorage.get('agent_code_time') || '',
                shop_id_time: cookieStorage.get('shop_id_time') || '',
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;

                if (res.data.access_token) {
                    var access_token = res.data.token_type + ' ' + res.data.access_token;
                    var expires_in = res.data.expires_in || 315360000;
                    // debugger;
                    cookieStorage.set("user_token", access_token, expires_in);
                    // cookieStorage.set("user_token",access_token,expires_in);
                    // wx.setStorageSync("user_token",access_token);
                    if (this.data.url) {
                        var path = [
                            'pages/entity/store/store',
                            'pages/index/index/index',
                            'pages/index/classification/classification',
                            'pages/store/tabCart/tabCart',
                            'pages/user/personal/personal',
                            'pages/travels/index/index',
                            'pages/user/collar/collar'
                        ];
                        var pathIndex = path.indexOf(this.data.url);
                        if (pathIndex == -1) {
                            wx.redirectTo({
                                url:"/"+this.data.url
                            })
                        } else {
                            wx.switchTab({
                                url:"/"+this.data.url
                            })
                        }
                    } else {
                        wx.switchTab({
                            url: '/pages/user/personal/personal'
                        })
                    }
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


    autoLogin(code) {
        sandBox.post({
            api: 'api/v2/oauth/miniprogram/login',
            data: {
                code: code,
                open_type:'miniprogram',
                shop_id: cookieStorage.get('shop_id') || '',
                agent_code: cookieStorage.get('coupon_agent_code') || cookieStorage.get('agent_code') || '',
                clerk_id: cookieStorage.get('clerk_id') || '',
                agent_code_time: cookieStorage.get('agent_code_time') || '',
                shop_id_time: cookieStorage.get('shop_id_time') || '',
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
                        var path = [
                            'pages/entity/store/store',
                            'pages/index/index/index',
                            'pages/index/classification/classification',
                            'pages/store/tabCart/tabCart',
                            'pages/user/personal/personal',
                            'pages/travels/index/index',
                            'pages/user/collar/collar'
                        ];
                        var pathIndex = path.indexOf(this.data.url);
                        if (pathIndex == -1) {
                            wx.redirectTo({
                                url:"/"+this.data.url
                            })
                        } else {
                            wx.switchTab({
                                url:"/"+this.data.url
                            })
                        }
                    } else {
                        wx.switchTab({
                            url: '/pages/user/personal/personal'
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
    }
})