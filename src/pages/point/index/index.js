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
        pointGoods:''

    },
    onLoad(){
        this.queryUserPoint('default')
        this.getPointGoods();

    },
    onShow(){

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
