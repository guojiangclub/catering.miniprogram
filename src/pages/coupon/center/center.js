import {
    config,
    sandBox,
    cookieStorage
} from "../../../lib/myapp.js"
Page({
    data:{
        dataList:[]
    },
    onLoad(){

    },
    onShow(){
        this.queryCouponList()

    },
//    获取领券列表
    queryCouponList() {
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/shitang/activity/list',
            header: {
                Authorization: token
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        dataList:res.data
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading()
        }).catch(rej => {
            wx.hideLoading()
            wx.showModal({
                content: rej.message || '请求失败',
                showCancel: false
            })
        })

    },
//    领取优惠券接口
    reciveCoupon(e) {
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        let token = cookieStorage.get('user_token');
        let idx = e.currentTarget.dataset.idx;
        let index = e.currentTarget.dataset.index;
        let coupon_code = e.currentTarget.dataset.code;
        sandBox.get({
            api: 'api/shitang/getCouponConvert',
            header: {
                Authorization: token
            },
            data:{
                coupon_code:coupon_code
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        [`dataList[${idx}].newItems[${index}].discount.has_get_status`]:1
                    })
                    wx.showToast({
                        title:'领取成功',
                        mask:true
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading()
        }).catch(rej => {
            wx.hideLoading()
            wx.showModal({
                content: rej.message || '请求失败',
                showCancel: false
            })
        })

    },
    jump(e){
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url:'/pages/coupon/onDetail/onDetail?id='+id
        })
    },


})