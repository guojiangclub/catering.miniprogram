import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
	    init: false,
		isOK: true,
        type: ''
	},
	onLoad(e) {
	    var type = e.type;
	    if (type) {
	       this.setData({
               type: e.type,
               formId: e.formId
           })
        }
        console.log('这个是id',e.formId);
        wx.showLoading({
            title: '加载中',
            mask: true
        });
		pageLogin(getUrl(), () => {
            setTimeout(() => {
                if (type == 'recharge') {
                    this.queryRechargeStatus(e.order_no, e.formId)
                } else {
                    this.queryBalanceStatus(e.order_no, e.formId);
                }
            }, 500)
		})
	},
	jump() {
		wx.redirectTo({
			url: '/pages/index/index/index'
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