import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';

Page({
    data: {
        list:''

    },
    onLoad() {
        this.getInfo()

    },
    getInfo() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        sandBox.get({
            api: 'api/uto/user/center'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if(res.status){
                    this.setData({
                        list:res.data
                    })
                } else{
                    wx.showModal({
                        content:res.message||"请求失败",
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content:res.message||"请求失败",
                    showCancel: false
                })
            }
            wx.hideLoading();
        }).catch(err => {
            wx.hideLoading();
            wx.showModal({
                content:"请求失败",
                showCancel: false
            })
        })
    },
    jump(e){
        wx.navigateTo({
            url:'/pages/other/links/links?url='+e.currentTarget.dataset.link
        })
    }
})