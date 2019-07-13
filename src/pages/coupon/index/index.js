import {config,sandBox,cookieStorage} from '../../../lib/myapp.js';
var app = getApp();

Page({
	data: {
		activeIndex: 0,
		sliderOffset: 0,
		width: 0,
		tabList: [
			{
				title: '线上',
				init: false,
				page: 0,
				more: true
			},
			{
				title: '线下',
				init: false,
				page: 0,
				more: true
			}
		],
		dataList: {
			0: [],
			1: []
		},
		is_coupon: 1, // 用于判断是否为优惠券 1：优惠券 0：促销折扣
        gbConfig: '',
        token: ''
	},
	onLoad(e) {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig
        })
		if (e.type) {
			this.setData({
				activeIndex: e.type
			})
		};
	},
	onShow(e) {
		var token = cookieStorage.get('user_token');
		if (token) {
			this.setData({
				token: token,
			});
            this.queryCouponList();
        } else {
			this.wxLogin();
		}

		/*wx.getSystemInfo({
			success: res => {
				this.setData({
					width: res.windowWidth / this.data.tabList.length,
					sliderOffset: res.windowWidth / this.data.tabList.length * this.data.activeIndex
				})
			}
		});*/
	},
    // 跳转
   /* jump(){
        wx.redirectTo({
            url:'/pages/pay/payBill/main'
        })
    },*/
    // 获取code
    getCode() {
        wx.login({
            success: res => {
                this.setData({
                    code: res.code
                })
            }
        })
    },
    // 获取code
    wxLogin() {
        wx.showLoading({
            title: '正在自动登录',
            mask: true
        })
        wx.login({
            success: res => {
                if (res.code) {
                    this.autoLogin(res.code);
                } else {
                    wx.showToast({
                        title: '获取code失败',
                        icon: 'none'
                    })
                }
            }
        })
    },
    //微信登录
    autoLogin(code) {
        sandBox.post({
            api: 'api/shitang/oauth/MiniProgramLogin',
            data: {
                code: code
            }
        }).then(res => {
            res = res.data;
            if (res.status) {
                if (res.data && res.data.open_id) {
                    cookieStorage.set('openId', res.data.open_id);
                    this.getCode();
                    this.getCoupon();
                }
                if (res.data && res.data.access_token) {
                    res.access_token = res.data.token_type + ' ' + res.data.access_token;
                    var expires_in = res.data.expires_in || 315360000;
                    cookieStorage.set('user_token', res.access_token, expires_in);

                    this.setData({
                        token: res.access_token
                    })
                    // this.jump();
                    this.queryCouponList();

                }

                if (!res.status) {
                    wx.showModal({
                        content: res.message || '请求失败，请重试',
                        showCancel: false,
                        success: res=>{
                            if (res.confirm || (!res.cancel && !res.confirm)) {
                                this.wxLogin();
                            }
                        }
                    })
                }
            } else {
                wx.showModal({
                    content: res.message || '请求失败，请重试',
                    showCancel: false,
                    success: res=>{
                        if (res.confirm || (!res.cancel && !res.confirm)) {
                            this.wxLogin();
                        }
                    }
                })
            }
            wx.hideLoading();
        }, err => {
            wx.showModal({
                content:'请求失败，请重试',
                showCancel: false,
                success: res=>{
                    if (res.confirm || (!res.cancel && !res.confirm)) {
                        this.wxLogin();
                    }
                }
            })
            wx.hideLoading();
        })
    },
    // 绑定手机号
    getPhoneNumber(e) {
        if (e.detail.encryptedData) {
            var data = {
                open_id: cookieStorage.get('openId'),
                iv: e.detail.iv,
                encryptedData: e.detail.encryptedData,
                code: this.data.code
            }

            app.createUser(data)
                .then(res => {
                    if (res.status) {
                    	// 领取优惠券
                        this.getCouponList();
                        // this.jump();
                    } else {
                        this.getCode();
                    }
                }, err => {
                    this.getCode();
                })
        } else {
            this.getCode();
        }
    },
    // 获取优惠券
    getCoupon() {
        wx.showLoading({
            title: '获取优惠信息',
            mask: true
        })
        sandBox.get({
            api: 'api/shitang/new/user/gift',
        }).then(res => {
            res = res.data;
            if (res.status) {
                this.setData({
                    coupon: res.data
                });

                if (res.data && res.data.coupons && res.data.coupons.length) {
                    var codes = [];
                    res.data.coupons.forEach(item => {
                        codes.push(item.code)
                    });
                    cookieStorage.set('coupon_codes', codes, '30n');
                }
            }
            wx.hideLoading();
        }, err => {
            wx.hideLoading();
        })
    },
	// 领取优惠券
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
                this.setData({
                    'coupon.dialog': false,
                    token: token
                })
                this.queryCouponList();
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
	tabClick(e) {
		var status = e.currentTarget.id;
		this.setData({
			sliderOffset: e.currentTarget.offsetLeft,
			activeIndex: status
		});
		if (!this.data.tabList[status].init) {
			this.queryCouponList(status);
		}
	},
	onReachBottom(e) {
		var status = this.data.activeIndex
		var page = this.data.tabList[status].page + 1;
		var tabList = `tabList[${status}]`;
		if (this.data.tabList[status].more) {
			this.queryCouponList(status,page);
		} else {
			wx.showToast({
				icon: 'none',
				title: '再拉也没有啦'
			});
		}
	},
	jumpOff() {
		wx.navigateTo({
		  url: '/pages/coupon/over/over'
		})
	},
	jumpDetailOn(e) {
		var id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '/pages/coupon/onDetail/onDetail?id=' + id + '&is_coupon=' + this.data.is_coupon
		})
	},
	jumpDetail(e) {
		var id = e.currentTarget.dataset.id;
		var coupon_id = e.currentTarget.dataset.coupon;
		wx.navigateTo({
			url: '/pages/coupon/offDetail/main?id=' + id + '&is_coupon=' + this.data.is_coupon + '&coupon_id=' + coupon_id
		})
	},
	jumpList(e) {
		var id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: '/pages/coupon/goods/goods?id=' + id
		})

	},
	convert() {
		var code = this.data.code;
		if (code == '') {
			wx.showModal({
				title: '',
				content: "请输入兑换码",
				showCancel: false
			})
		} else {
			this.convertCoupon(code);
		}

	},
	input(e) {
		var vlaue = e.detail.value

		this.setData({
			code: vlaue
		})
	},
	viewDetail(e) {
		var type = e.currentTarget.dataset.info.discount.type;
		var id = e.currentTarget.dataset.info.id;
		if (type == 0) {
			wx.navigateTo({
				url: '/pages/coupon/onDetail/onDetail?id=' + id
			})
		} else {
			wx.navigateTo({
				url: '/pages/coupon/offDetail/main?id=' + id
			})
		}
	},
	// 查询优惠券列表
	queryCouponList(type = 0, page = 1) {

		wx.showLoading({
			title: "加载中",
			mask: true
		});

		var token = cookieStorage.get('user_token') || '';
		sandBox.get({
			api: 'api/shitang/coupon/list',
			header: {
				Authorization: token
			},
			data: {
				page,
                type: 'active'
			}
		}).then(res => {
			if (res.statusCode == 200) {
				res = res.data;

				if (res.status) {
					var pages = res.meta.pagination;
					var current_page = pages.current_page;
					var total_pages = pages.total_pages;
					var tabList = `tabList[${type}]`;
					this.setData({
						[`dataList.${type}[${page - 1}]`] : res.data,
						[`${tabList}.init`]: true,
						[`${tabList}.page`]: current_page,
						[`${tabList}.more`]: current_page < total_pages,
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
				content: res.message || '请求失败',
				showCancel: false
			})
		})

	},
    toast() {
        wx.navigateTo({
            url:'/pages/coupon/over/over'
        })
    }
})