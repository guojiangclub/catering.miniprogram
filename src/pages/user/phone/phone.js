import {config,getUrl,pageLogin,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data:{
        code: '',
	    url: ''
    },
	onLoad(e){
    	if (e.url) {
    		this.setData({
    			url: e.url
		    })
	    }
    },
    getCode() {


    },
    jumpPhone(){
		if (this.data.url) {
			wx.navigateTo({
				url: '/pages/user/bindingphone/bindingphone?url=' + this.data.url
			})
		} else {
			wx.navigateTo({
				url: '/pages/user/bindingphone/bindingphone'
			})
		}

    },
    getPhoneNumber(e) {
        if (e.detail.encryptedData) {
            wx.login({
                success: res => {
                    if (res.code) {
                        this.setData({
                            code: res.code
                        }, res => {
                            this.phone(e);
                        })
                    } else {
                        wx.showModal({
                            content: " 获取code失败",
                            showCancel: false
                        })
                    }
                }
            });
            console.log(this.data.code);
            return
        } else {
           this.jumpPhone();
        }
    },
    phone(e) {
        sandBox.post({
            api: 'api/users/MiniProgramBindMobile',
            data: {
                code: this.data.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
            },
            header:{
                Authorization: cookieStorage.get('user_token')
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    wx.showModal({
                        content: '绑定成功',
                        showCancel: false,
                        success: res=>{
                            if (res.confirm || (!res.cancel && !res.confirm)) {
                                if (this.data.url) {
                                    wx.redirectTo({
                                        url: '/' + decodeURIComponent(this.data.url)
                                    })
                                } else {
                                    wx.switchTab({
                                        url: '/pages/user/personal/personal'
                                    })
                                }
                            }
                        }
                    })
                } else {
                    wx.showModal({
                        content: res.message || '绑定失败',
                        showCancel: false,
                    })
                }
            }  else {
                wx.showModal({
                    content: '请求失败，请重试',
                    showCancel: false
                })
            }
        }).catch(rej => {
            wx.showModal({
                content: '请求失败，请重试',
                showCancel: false
            })
        })
    }

})