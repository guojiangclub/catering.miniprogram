
import {config,getUrl,pageLogin,sandBox,cookieStorage} from '../../../lib/myapp.js';

Page({
    data: {
        nick_name: '',
        openid: '',
        agent_code: '',
        avatar: '',
        is_tab: false
    },
    onLoad(e) {
      this.setData({
          agent_code: e.agent_code,
          openid: e.open_id,
          url: e.url ? decodeURIComponent(e.url) : '',
          is_tab: e.is_tab ? e.is_tab : ''
      })
    },
    bindgetuserinfo(e) {
        if (e.detail.encryptedData) {
            this.setData({
                nick_name: e.detail.userInfo.nickName,
                avatar: e.detail.userInfo.avatarUrl
            }, () => {
                this.submit();
            })
        } else {
            wx.showToast({
                title: '为了给您提供更好的服务，我们需要您的授权~',
                icon: 'none'
            })
        }
    },
    submit() {
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        sandBox.post({
            api: 'api/v2/oauth/miniprogram/user-login',
            data: {
                nick_name: this.data.nick_name,
                openid: this.data.openid,
                agent_code: this.data.agent_code,
                avatar: this.data.avatar
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    if (res.data.access_token) {
                        var access_token = res.data.token_type + ' ' + res.data.access_token;
                        var expires_in = res.data.expires_in || 315360000;
                        cookieStorage.set("user_token", access_token, expires_in);
                    }
                    if (this.data.url) {
                        if (!this.data.is_tab) {
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
                            url:"/pages/index/index/index"
                        })
                    }
                } else {
                    wx.showModal({
                        content:res.message || '未知错误，请重试',
                        showCancel: false
                    })
                }
                wx.hideLoading();
            } else {
                wx.hideLoading();
                wx.showModal({
                    content:'服务器错误，请重试',
                    showCancel: false,
                })
            }
        })
    }
})