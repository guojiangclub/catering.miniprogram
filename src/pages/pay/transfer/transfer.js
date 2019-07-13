import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';
var app = getApp();
Page({
    data: {
        init:false,
        code: '',
        amount: '',
        order_no: '',
        coupon: '',
        codes: '',
        type: ''
    },
    onLoad(e) {
        if (e.type) {
            this.setData({
                type: 'recharge'
            })
        }
        /*if (e.q) {
            var str = decodeURIComponent(e.q).split('?');
            if (str[1]) {
                var url = JSON.parse('{"' +  decodeURIComponent(e.q).split('?')[1].replace(/&/g, "\",\"").replace(/=/g,"\":\"") + '"}')
                if (url.id) {
                    this.id = url.id
                } else {
                    wx.showModal({
                        content:'参数错误',
                        showCancel: false
                    })
                    return
                }

                if (url.amount) {
                    this.amount = url.amount
                    this.order_no = url.order_no
                }
            } else {
                wx.showModal({
                    content:'参数错误',
                    showCancel: false
                })
                return
            }
        }*/
        var token = cookieStorage.get('user_token');
        if (token) {
            this.jump();
        } else {
            this.wxLogin();
        }

    },
    // 跳转
    jump(){
        if (this.data.type) {
            wx.redirectTo({
                url:'/pages/pay/recharge/main'
            })
        } else {
            wx.redirectTo({
                url:'/pages/pay/payBill/main'
            })
        }

    },
    // 获取code
    getCode() {
        wx.login({
            success: res => {
                this.setData({
                    code: res.code
                })
            }
        })
    },
    // 获取code
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
                        icon: 'none'
                    })
                }
            }
        })
    },
    //微信登录
    autoLogin(code) {
        sandBox.post({
            api: 'api/shitang/oauth/MiniProgramLogin',
            data: {
                code: code
            }
        }).then(res => {
            res = res.data;
            if (res.status) {
                if (res.data && res.data.open_id) {
                    cookieStorage.set('openId', res.data.open_id);
                    this.getCode();
                    this.getCoupon();
                }
                if (res.data && res.data.access_token) {
                    res.access_token = res.data.token_type + ' ' + res.data.access_token;
                    var expires_in = res.data.expires_in || 315360000;
                    cookieStorage.set('user_token', res.access_token, expires_in);
                    this.jump();
                }

                if (!res.status) {
                    wx.showModal({
                        content: res.message || '请求失败，请重试',
                        showCancel: false,
                        success: res=>{
                            if (res.confirm || (!res.cancel && !res.confirm)) {
                                this.wxLogin();
                            }
                        }
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败，请重试',
                    showCancel: false,
                    success: res=>{
                        if (res.confirm || (!res.cancel && !res.confirm)) {
                            this.wxLogin();
                        }
                    }
                })
            }
            wx.hideLoading();
        }, err => {
            wx.showModal({
                content:'请求失败，请重试',
                showCancel: false,
                success: res=>{
                    if (res.confirm || (!res.cancel && !res.confirm)) {
                        this.wxLogin();
                    }
                }
            })
            wx.hideLoading();
        })
    },
    // 绑定手机号
    getPhoneNumber(e) {
        if (e.detail.encryptedData) {
            var data = {
                open_id: cookieStorage.get('openId'),
                iv: e.detail.iv,
                encryptedData: e.detail.encryptedData,
                code: this.data.code
            }

            app.createUser(data)
                .then(res => {
                    if (res.status) {
                        this.jump();
                    } else {
                        this.getCode();
                    }
                }, err => {
                    this.getCode();
                })
        } else {
            this.getCode();
        }
    },
    // 获取优惠券
    getCoupon() {
        wx.showLoading({
            title: '获取优惠信息',
            mask: true
        })
        sandBox.get({
            api: 'api/shitang/new/user/gift',
        }).then(res => {
            res = res.data;
            if (res.status) {
                this.setData({
                    coupon: res.data
                });

                if (res.data && res.data.coupons && res.data.coupons.length) {
                    var codes = [];
                    res.data.coupons.forEach(item => {
                        codes.push(item.code)
                    });
                    cookieStorage.set('coupon_codes', codes, '30n');
                }
            }
            wx.hideLoading();
        }, err => {
            wx.hideLoading();
        })
    }
})