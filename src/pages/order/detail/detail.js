import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';
var app = getApp();
Page({
    data: {
        orderDetail: ''
    },
    onLoad(e) {
        if (!e.order) {
            wx.showModal({
                content:"参数错误",
                showCancel:false
            })
            return
        }
        this.setData({
            order: e.order
        })
        this.orderDetail();
    },
    // 获取订单列表
    orderDetail() {
        var token = cookieStorage.get('user_token');

        wx.showLoading({
            title: '加载中',
            mask: true
        })
        sandBox.get({
            api: 'api/shitang/order/detail/' + this.data.order,
            header: {
                Authorization: token
            },
        }).then(res => {
            res = res.data;
            if (res.status) {
                this.setData({
                    orderDetail: res.data
                })
            } else {
                wx.showModal({
                    content:res.message || "服务器有点小拥挤，请重试！",
                    showCancel:false
                })
            }
            wx.hideLoading();
        }, err => {
            wx.showModal({
                content:"服务器有点小拥挤，请重试！",
                showCancel:false
            })
            wx.hideLoading();
        })
    }
})