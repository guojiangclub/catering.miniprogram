import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';
var app = getApp();
Page({
    data: {
        init:false,
        orderList:[],
        page:0,
        hasMore:true,
    },
    onLoad(e) {
        this.getList();
    },
    onReachBottom() {
        var page = this.data.page+1
        if (this.data.hasMore) {
            this.getList(page);
        } else {
            wx.showToast({
                title: '没有更多了',
                icon: 'none'
            });
        }
    },
    jumpDetail(e) {
        var order = e.currentTarget.dataset.order;
        console.log(order);
        if (order) {
            wx.navigateTo({
                url: '/pages/coupon/detail/detail?order=' + order
            })
        }
    },
    // 获取订单列表
    getList(page = 1) {
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/shitang/order/list',
            data: {
                page
            },
            header: {
                Authorization: token
            },
        }).then(res => {
            res = res.data;
            if (res.status) {
                var orderList;
                var page = res.meta.pagination;
                var current_page = page.current_page;
                var total_pages = page.total_pages;
                if(current_page === 1){
                    orderList = res.data;
                } else {
                    orderList = this.data.orderList.concat(res.data);
                }
                this.setData({
                    orderList: orderList,
                    page: page.current_page,
                    hasMore: current_page < total_pages,
                    init: true
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