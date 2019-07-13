import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';

Page({
    data: {
      info: ''
    },
    onLoad(e) {
       this.getInfo();
    },
    jumpRecharge(){
        wx.navigateTo({
            url:'/pages/recharge/index/index'
        });
    },
    jumpPoint(){
        wx.navigateTo({
            url:'/pages/pointStore/index/index'
        });
    },
    jumpStore(){
        wx.navigateTo({
            url:'/pages/store/list/list'
        });
    },
    jumpRights() {
        var link = this.data.info.vip_plan_equity_link
        wx.navigateTo({
            url:'/pages/other/links/links?url=' + link
        });
    },
    jumpPath(e) {
        var type = e.currentTarget.dataset.type;
        var link = e.currentTarget.dataset.link;

        if (type == 'wechat') {
            wx.navigateTo({
                url:'/pages/other/links/links?url=' + link
            });
        } else if (type == 'miniprogram') {
            wx.navigateTo({
                url: link
            });
        }
    },
    getInfo() {
        var token = cookieStorage.get('user_token');
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        sandBox.get({
            api: 'api/uto/userInfo',
            header: {
                Authorization: token
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if(res.status){
                    this.setData({
                        info:res.data
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
    }
})