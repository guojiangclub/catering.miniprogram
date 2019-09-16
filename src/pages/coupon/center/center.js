import {
    config,
    sandBox,
    cookieStorage
} from "../../../lib/myapp.js"
Page({
    data:{

    },
    onLoad(){

    },
    onShow(){
        this.queryCouponList(1)

    },
//    获取领券列表
    queryCouponList(id) {
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/shitang/activity/detail/'+id,
            header: {
                Authorization: token
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        detail:res.data
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


})