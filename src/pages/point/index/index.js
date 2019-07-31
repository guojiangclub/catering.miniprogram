var app = getApp();

import {
    config,
    pageLogin,
    sandBox,
    getUrl,
    cookieStorage
} from '../../../lib/myapp.js';

Page({
    data:{
        point:'',
        pointGoods:'',
        userInfo: ''

    },
    onLoad(){
        setTimeout(() => {
            let initInfo = cookieStorage.get('init');
            this.setData({
                initInfo: initInfo
            })
        }, 500)

        let token = cookieStorage.get('user_token');
        if(token){
            this.queryUserPoint('default')
            this.getPointGoods();
            this.getUserInfo();
        } else {
            wx.navigateTo({
                url:'/pages/user/register/register'
            })
        }
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
                    userInfo:res.data.data
                })
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
    // 查询用户积分
    queryUserPoint(type) {
        let token = cookieStorage.get('user_token');

        sandBox.get({
            api:'api/users/point',
            header:{
                Authorization:token
            },
            data:{
                type: type
            }
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                this.setData({
                    point: res
                })
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }
        })

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
    jumpLink(e) {
        let link = e.currentTarget.dataset.link;
        wx.navigateTo({
            url: link
        });
    },
})
