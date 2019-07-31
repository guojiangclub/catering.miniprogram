import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
	data: {
	    init: false,
		isOK: true,
        type: '',
        orderInfo: ''
	},
	onLoad(e) {
        pageLogin(getUrl(), () => {
            setTimeout(() => {
                this.queryRechargeStatus(e.order_no, e.formId)
            }, 500)
        })
	},
	jump(e) {
	    let link = e.currentTarget.dataset.link
		wx.redirectTo({
			url: link
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
                    orderInfo: res.data,
                    isOK: Boolean(res && res.data && res.data.order && res.data.order.pay_status == 1)
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