import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';

Page({
    data: {
        formId: '',  // 模板id
        report: true, // 表单开启
        merOrderId: '', // 订单编号
        show_dis: false,  // 弹出优惠券列表
        show_recharge: false, // 弹出充值列表
        show_sure: false, // 弹出充值确认
        show_cover: true, // 备注隐藏
        note: '', // 备注
        select_coupon: '', // 用户选中的优惠券
        discountList:[],  //所循环的优惠券列表
        dataList:[],  //后台给我的优惠券列表
        userInfo: '',  // 用户信息
        schemes: '', // 充值方案
        amount: '',  // 输入金额
        pay_amount: '', // 需要支付的金额
        balance: 0,  // 余额
        point: 0,  // 积分
        point_deduction: '', // 一积分抵扣多少钱（分）
        rechargeItem: '', // 选中的充值方案
        form: {
            balance: {
                value: 0,  // 可使用的值
                money: 0,  // 可抵扣多少钱
                status: false // 是否选择
            },
            point: {
                value: 0,
                money: 0,
                status: false
            },
            coupon: {
                value: 0,
                money: 0,
            },
            initInfo: ''
        }
    },
    onLoad(e) {
        setTimeout(() => {
            let initInfo = cookieStorage.get('init');
            this.setData({
                initInfo: initInfo
            })
        }, 1000)

        this.getUserInfo();
      this.getCouponList();
      this.getSchemes();
      this.getDiscounts();
    },
    // 金额输入
    tatolInput(e) {
        var val = e.detail.value;
        if (!val) {
            val = ''
        } else if (/\S*$/.test(val)) {
            val = val.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
        }
        this.setData({
            amount: val ? val : ''
        }, () => {
            this.computeMoney();
        })
    },
    // 备注
    note(e) {
      this.setData({
          note: e.detail.value
      })
    },
    // 优惠券弹出
    showDis() {
        if (this.data.amount == '') {
            wx.showModal({
                content:'请先输入消费金额',
                showCancel:false
            })
        } else if (!this.data.discountList.length) {
            wx.showModal({
                content:'暂无可用优惠券',
                showCancel:false
            })
        } else {
            this.setData({
                show_dis: true,
                show_cover: !this.data.show_cover
            })
        }

    },
    clearDis() {
        this.setData({
            show_dis: false,
            show_cover: !this.data.show_cover
        })
        this.computeMoney();
    },
    // 切换充值
    changeRecharge() {
        console.log(1);
        this.setData({
            show_recharge: !this.data.show_recharge,
            show_cover: !this.data.show_cover,
            rechargeItem: '',
            schemes: this.data.schemes
        })
    },
    // 切换优惠券
    changedis() {
        console.log(2);
        this.setData({
            show_dis: !this.data.show_dis,
            show_cover: !this.data.show_cover
        })
    },
    // 充值确认按钮
    rechargeSure(e) {
        if (this.data.rechargeItem == '') {
            wx.showModal({
                content:'请选择充值方案',
                showCancel:false
            })
            return false
        }
        this.setData({
            show_sure: true,
            show_recharge: false
        })
    },
    // 充值取消
    clearSure() {
        this.setData({
            show_sure: false,
            rechargeItem: '',
            show_cover: !this.data.show_cover
        })
    },
    // 充值方案弹出选择
    recharRadioChange(e) {
        var value = e.detail.value;
        if (value == '-1') {
            this.setData({
                rechargeItem: ''
            })
        } else {
            this.setData({
                rechargeItem: this.data.schemes[value]
            })
        }
    },
    // 底部充值
    afterRecharge(e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/recharge/index/index?id=' + id
        })
    },
    // 余额选择框
    balanceSwitch(e) {
        if (!this.data.amount) {
            wx.showModal({
                content:'请先输入消费金额',
                showCancel:false
            })
            this.setData({
                'form.balance.status': false
            })
            return false
        }
        if (!e.detail.value) {
            this.setData({
                'form.balance.value': this.data.balance,
                'form.balance.money': this.data.balance
            })
        }
        this.setData({
            'form.balance.status': e.detail.value
        }, () => {
            this.computeMoney();
        })
    },
    // 积分选择框
    pointSwitch(e) {
        var pay_amount = this.data.pay_amount;

        if (!this.data.point) {
            wx.showModal({
                content:'暂无可用积分',
                showCancel:false
            })
            this.setData({
                'form.point.status': false
            })
            return false
        }

        if (!this.data.amount) {
            wx.showModal({
                content:'请先输入消费金额',
                showCancel:false
            })
            this.setData({
                'form.point.status': false
            })
            return false
        }

        if (this.data.point < this.data.point_deduction_point) {
            wx.showModal({
                content:'不满足最低抵扣',
                showCancel:false
            })
            this.setData({
                'form.point.status': false
            })
            return false
        }

        if (!e.detail.value) {
            this.setData({
                'form.point.value': this.data.point,
                'form.point.money': Number((this.data.point * this.data.point_deduction).toFixed(0)),
            })
        } else if (pay_amount <= 0 && this.data.form.balance.status) {
            wx.showModal({
                content: "暂不可使用积分",
                showCancel: false
            });
        }
        this.setData({
            'form.point.status': e.detail.value
        }, () => {
            this.computeMoney();
        })
    },
    // 计算金钱
    computeMoney() {
        // 金额单位：分
        var amount = Number((this.data.amount * 100).toFixed(2));
        var pay_amount = this.data.pay_amount || amount;

        console.log(amount);
        // 计算余额


        // 余额
        if (this.data.form.balance.status) {
            if (!pay_amount) {
                console.log(1)
                this.setData({
                    pay_amount: 0,
                    'form.balance.value': this.data.balance,
                    'form.balance.money': this.data.balance,
                    'form.balance.status': false
                })
            } else {
                this.setData({
                    'form.balance.value': Math.min(this.data.balance, amount),
                    'form.balance.money': Math.min(this.data.balance, amount)
                })
                pay_amount = amount - this.data.form.balance.money;
                this.setData({
                    pay_amount: pay_amount
                })
            }
        }

        // 积分
        if (this.data.form.point.status) {
            var balanceMoney = 0;
            if (this.data.form.balance.status) {
                balanceMoney = this.data.form.balance.money
            }
            pay_amount = amount - balanceMoney;

            if (!pay_amount) {
                console.log(2)
                this.setData({
                    pay_amount: 0,
                    'form.point.value': this.data.point,
                    'form.point.money': Number((this.data.point * this.data.point_deduction).toFixed(0)),
                    'form.point.status': false
                })
            } else {
                this.setData({
                    'form.point.value': Math.min(this.data.point, (pay_amount * this.data.point_deduction_point).toFixed(2)),
                    'form.point.money': Math.min((this.data.point * this.data.point_deduction).toFixed(0), (pay_amount).toFixed(0))
                })
                pay_amount = pay_amount - this.data.form.point.money;
                this.setData({
                    pay_amount: pay_amount
                })
            }
        }

        // 优惠券
        this.screenDiscount();


        if (this.data.select_coupon) {
            var balanceMoney = 0;
            var pointMoney = 0;
            if (this.data.form.balance.status) {
                balanceMoney = this.data.form.balance.money
            }
            if (this.data.form.point.status) {
                pointMoney = this.data.form.point.money
            }

            pay_amount = amount - balanceMoney - pointMoney;

            var discount_money = this.data.select_coupon.discount.action_type.value * 100;

            if(this.data.select_coupon.discount.action_type.type == 'cash'){

                this.setData({
                    'form.coupon.value': discount_money,
                    'form.coupon.money': discount_money
                })

                if (pay_amount < discount_money){
                    console.log(11);
                    discount_money = pay_amount;
                    this.setData({
                        'form.coupon.value': discount_money,
                        'form.coupon.money': discount_money
                    })
                }
                pay_amount = pay_amount - discount_money;
                if ( pay_amount <= 0){
                    this.setData({
                        pay_amount: 0
                    })
                } else {
                    this.setData({
                        pay_amount: pay_amount
                    }, () => {
                        console.log(this.data.pay_amount, pay_amount);
                    })
                }

            } else {
                console.log(22);
                var value = ((1-discount_money / 10)) * pay_amount;
                pay_amount = (discount_money / 10) * pay_amount;

                this.setData({
                    'form.coupon.value': discount_money,
                    'form.coupon.money': discount_money,
                })
            }
        }

        if (!this.data.form.balance.status && !this.data.form.point.status && !this.data.select_coupon) {
            this.setData({
                pay_amount: amount
            })
        }
    },
    //radio选中项发生变化触发change事件
    disRadioChange(e){
        //获取用户选中优惠券的id
        var couponId = e.detail.value;
        //然后根据id 去判断选中后用户选中的那张优惠券，从后台拿到的数据去筛选
        this.data.dataList.forEach(val=>{
            if (couponId == -1) {
                this.setData({
                    select_coupon: ''
                })
            }
            if (val.id == couponId){
                this.setData({
                    select_coupon: val,
                    'val.isCheck': true
                })
            } else {
                this.setData({
                    'val.isCheck': false
                })
            }
        })
        this.computeMoney();
    },
    //删选可用优惠券
    screenDiscount(){
        console.log(3)
        if (!this.data.amount){
            this.setData({
                discountList: this.data.dataList,
                select_coupon: ''
            })
        } else {
            var amount = Number((this.data.amount * 100).toFixed(2));
            var pay_amount = this.data.pay_amount || amount;
            var balanceMoney = 0;
            var pointMoney = 0;
            if (this.data.form.balance.status) {
                balanceMoney = this.data.form.balance.money
            }
            if (this.data.form.point.status) {
                pointMoney = this.data.form.point.money
            }
            pay_amount = amount - balanceMoney - pointMoney;
            console.log(pay_amount);
            var old_list = this.data.dataList;
            var new_list = [];

            // 如果当前金额不满足之前选择的优惠券的使用条件，就将这张优惠券去掉。
            if (this.data.select_coupon && pay_amount < this.data.select_coupon.discount.rule_type.amount) {
                this.setData({
                    select_coupon: ''
                })
            }

            //循环当前数组
            old_list.forEach((val,index)=>{
                if(pay_amount >= val.discount.rule_type.amount){
                    if (this.data.select_coupon && val.id == this.data.select_coupon.id) {
                        val.isCheck = true
                    } else {
                        val.isCheck = false
                    }
                    new_list.push(val)
                }
            })
            this.setData({
                discountList: new_list
            })
        }
    },
    // 获取优惠券列表
    getCouponList() {
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        var token = cookieStorage.get('user_token')
        sandBox.post({
            api: 'api/shitang/active/coupon/list',
            data: {
                codes: cookieStorage.get('coupon_codes') || '',
            },
            header:{
                Authorization: token
            }
        }).then(res => {
            res = res.data;
            if (res.status) {
                if (res.data.coupons.length > 0) {
                    res.data.coupons.forEach(val => {
                        val.isCheck = false
                    })
                }
                this.setData({
                    dataList: res.data.coupons,
                    discountList: res.data.coupons
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
    // 获取用户信息
    getUserInfo() {
        var token = cookieStorage.get('user_token');

        sandBox.get({
            api: 'api/shitang/me',
            data: {
                includes: 'group'
            },
            header:{
                Authorization: token
            }
        }).then(res => {
            res = res.data;
            if (res.status) {
                this.setData({
                    userInfo: res.data
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
                    res.data.forEach(val => {
                        val.isCheck = false
                    })
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
    // 获取余额，积分等信息
    getDiscounts() {
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        var token = cookieStorage.get('user_token');

        sandBox.get({
            api: 'api/shitang/user/discounts/info',
            header:{
                Authorization: token
            }
        }).then(res => {
            res = res.data;
            if (res.status) {

                this.setData({
                    balance: res.data.balance,
                    point: Number(res.data.point.point),
                    point_deduction: Number(res.data.point_deduction),
                    point_deduction_point: Number(Number((1 / res.data.point_deduction)).toFixed(2)),
                    'form.balance.value': res.data.balance,
                    'form.balance.money': res.data.balance,
                    'form.point.value': Number(res.data.point.point),
                    'form.point.money': Number(((res.data.point.point) * res.data.point_deduction).toFixed(0)),
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

    // 提交支付
    submitOrder(e) {
        this.setData({
            formId: e.detail.formId
        })
        var token = cookieStorage.get('user_token');

        if (!this.data.amount) {
            wx.showModal({
                content:'请先输入消费金额',
                showCancel:false
            })
            return
        }
        wx.login({
            success: ret => {
                wx.showLoading({
                    title:"加载中",
                    mask:true
                });
                var data = {
                    code:ret.code,  // code
                    total_amount: (this.data.amount * 100).toFixed(0), // 订单总金额
                    amount: this.data.pay_amount, // 需要支付金额
                    balance: this.data.form.balance.status ? this.data.form.balance.money : 0, // 余额
                    point: this.data.form.point.status ? this.data.form.point.value : 0, // 积分
                    coupon_id: this.data.select_coupon ? this.data.select_coupon.id : 0, // 优惠券id
                    point_money: this.data.form.point.status ? this.data.form.point.money : 0, // 积分抵扣的钱
                    note: this.data.note
                }
                // 当支付金额大于0时，为组合支付
                if (data.amount > 0) {
                    data.channel = 'wx_lite'
                } else if (data.amount === 0){ // 当支付金额等于0时，为其他支付类型
                    // 当余额等于订单金额时，为纯余额支付
                    if (data.balance == data.total_amount) {
                        data.channel = 'balance'
                    } else if (data.point_money == data.total_amount) { // 当积分等于订单金额时，为纯积分支付
                        data.channel = 'point'
                    } else { // 其他情况为积分加余额支付
                        data.channel = 'balance_point'
                    }
                } else {
                    wx.showModal({
                        content:'支付数据错误，请返回重试',
                        showCancel:false
                    })
                    return
                }
                sandBox.post({
                    api: 'api/shitang/unifiedOrder',
                    header:{
                        Authorization: token
                    },
                    data: data
                }).then(res => {
                    res = res.data;
                    if (res.status) {
                        if (res.data && (res.data.type == 'balance' || res.data.type == 'point' || res.data.type == 'balance_point')) {
                            // 直接跳转到支付成功页面
                            wx.redirectTo({
                                url: '/pages/pay/success/success?order_no=' + res.data.order_no + '&formId=' + this.data.formId
                            })
                        } else {
                            this.setData({
                                merOrderId: res.data.merOrderId
                            })
                            this.newcharge(true, res.data.miniPayRequest, 'pay');  // 调起支付
                        }
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
                            url: '/pages/pay/success/success?order_no='+this.data.merOrderId + '&type=' + type + '&formId=' + this.data.formId
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