import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
	    init: false,
		isOK: true,
        type: ''
	},
	onLoad(e) {

	},
	jump() {
		wx.redirectTo({
			url: '/pages/user/index/main'
		})
	},
    queryRechargeStatus(order_no, formId) {
        var token = cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/shitang/recharge/paidSuccess/' + order_no,
            header: {
                Authorization: token
            },
            data: {
                formId: formId
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                this.setData({
                    isOK: Boolean(res && res.data && res.data.pay_status == 1)
                })
                if (this.data.isOK) {
                    this.setData({
                        init: true
                    })
                } else {
                    this.setData({
                        isOK: false,
                        init: true
                    })
                    wx.showModal({
                        content: res.message || "支付失败",
                        showCancel: false,
                    })
                }
                wx.hideLoading()
            } else {
                wx.hideLoading()
                this.setData({
                    isOK: false,
                    init: true
                })
                wx.showModal({
                    content: "支付失败",
                    showCancel: false,
                })
            }
        })
    },
	queryBalanceStatus(order_no, formId) {
		var token = cookieStorage.get('user_token');
		sandBox.get({
			api: 'api/shitang/order/paidSuccess/' + order_no,
            header: {
                Authorization: token
            },
            data: {
                formId: formId
            }
		}).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                this.setData({
                    isOK: Boolean(res && res.data && res.data.order.status == 2)
                })
                if (this.data.isOK) {
                    this.setData({
                        init: true
                    })
                } else {
                    this.setData({
                        isOK: false,
                        init: true
                    })
                    wx.showModal({
                        content: res.message || "支付失败",
                        showCancel: false,
                    })
                }
                wx.hideLoading()
            } else {
                wx.hideLoading()
                this.setData({
                    isOK: false,
                    init: true
                })
                wx.showModal({
                    content: "支付失败",
                    showCancel: false,
                })
            }
		})
	}

})