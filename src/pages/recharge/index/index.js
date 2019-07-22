import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js'
Page({
   data:{
       formId: '',  // 模板id
       report: true, // 表单开启
       config: '',
       schemes: '',
       rechargeItem: '',
       id: '', // 从买单页面带过来的id
   },
   onLoad(e){
       if (e.id) {
           this.setData({
               id: e.id
           })
       }
       this.getSchemes();
   },
    jump() {
	    wx.navigateTo({
	        url: '/pages/pay/payBill/main'
        })
    },
    changeItem(e) {
        let item = e.currentTarget.dataset.item;
        this.setData({
            rechargeItem: item
        })
    },
    // 获取充值方案
    getSchemes() {
        var token = cookieStorage.get('user_token');

        sandBox.get({
            api: 'api/users/balance/schemes',
            header:{
                Authorization: token
            }
        }).then(res => {
            res = res.data;
            if (res.status) {
                if (res.data && res.data.length > 0) {
                    if (String(this.data.id)) {
                        res.data.forEach(val => {
                            if (val.id == this.data.id) {
                                this.setData({
                                    rechargeItem: val
                                })
                            }
                        })
                    } else {
                        this.setData({
                            rechargeItem: res.data[0]
                        })
                    }
                }
                this.setData({
                    schemes: res.data
                })
            } else {
                wx.showModal({
                    content:res.message ||  "请求失败",
                    showCancel: false
                });
            }
            wx.hideLoading();
        }, err => {
            wx.showModal({
                content:"请求失败",
                showCancel: false
            });
            wx.hideLoading();
        })
    },

    // 提交充值请求
    submitRecharge(e) {
        var token = cookieStorage.get('user_token');
        this.setData({
            formId: e.detail.formId
        })
        wx.login({
            success: ret => {
                wx.showLoading({
                    title:"加载中",
                    mask:true
                });
                var data = {
                    code:ret.code,
                    recharge_rule_id: this.data.rechargeItem.id,
                    amount: Number(this.data.rechargeItem.amount) / 1,
                    pay_amount: Number(this.data.rechargeItem.payment_amount) / 1,
                    channel: 'wx_lite'
                }
                sandBox.post({
                    api: 'api/shitang/recharge',
                    header:{
                        Authorization: token
                    },
                    data: data
                }).then(res => {
                    res = res.data;
                    if (res.status) {
                        this.setData({
                            show_sure: false,
                            rechargeItem: '',
                            merOrderId: res.data.merOrderId
                        })
                        this.newcharge(true, res.data.miniPayRequest, 'recharge')
                    } else {
                        wx.showModal({
                            content:res.message ||  "请求失败",
                            showCancel: false
                        });
                    }
                    wx.hideLoading();
                }, err => {
                    wx.showModal({
                        content:"请求失败",
                        showCancel: false
                    });
                    wx.hideLoading();
                })
            }
        })
    },

    //调起支付
    newcharge(success, charge, type) {
        if (success) {
            var that = this;
            wx.showLoading({
                title:'支付中',
                mask:true
            })
            wx.requestPayment({
                "timeStamp": charge.timeStamp,
                "nonceStr": charge.nonceStr,
                "package": charge.package,
                "signType": charge.signType,
                "paySign": charge.paySign,
                success: res => {
                    if (res.errMsg == 'requestPayment:ok') {
                        console.log('这个也是', this.data.formId);
                        wx.hideLoading();
                        wx.redirectTo({
                            url: '/pages/recharge/success/success?order_no='+this.data.merOrderId + '&type=' + type + '&formId=' + this.data.formId
                        })
                    } else {
                        console.log(res);
                        wx.showModal({
                            content: '调用支付失败！',
                            showCancel: false
                        })
                    }
                },
                fail: err => {
                    wx.hideLoading();
                    if (err.errMsg == 'requestPayment:fail cancel') {
                        if (type == 'pay') {
                            // 取消支付请求该接口
                            this.cancelPay();
                        }
                    } else {
                        wx.showModal({
                            content: '调用支付失败！',
                            showCancel: false
                        })
                    }
                }
            })
        } else {
            wx.hideLoading();
            wx.showModal({
                content: charge || '请求支付失败，请重试！',
                showCancel: false
            })
        }
    },

    // 取消支付需要请求接口
    cancelPay() {
        var token = cookieStorage.get('user_token');

        wx.showLoading({
            title: '加载中',
            mask: true
        })
        sandBox.get({
            api: 'api/shitang/order/cancel/' + this.data.merOrderId,
            header:{
                Authorization: token
            },
        }).then(res => {
            res = res.data;
            if (res.status) {

            } else {
                wx.showModal({
                    content:res.message ||  "请求失败",
                    showCancel: false
                });
            }
            wx.hideLoading();
        }, err => {
            wx.showModal({
                content:"请求失败",
                showCancel: false
            });
            wx.hideLoading();
        })
    }
})