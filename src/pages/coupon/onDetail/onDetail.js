import {config,sandBox,pageLogin,getUrl,cookieStorage} from '../../../lib/myapp.js';

Page({
	data: {
		detail: '',
		is_coupon: 1, // 用于判断是否为优惠券 1：优惠券 0：促销折扣
		init: false,
        agent_code: '',
		config: ''
	},
	onLoad(e) {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig
        })
		var id = e.id;

		this.queryCouponDetail(id);
    },
	jumpList(e) {
		wx.navigateTo({
			url: '/pages/coupon/goods/goods?id=' + this.data.detail.coupon_id
		})

	},
	getCoupon() {
		var token = cookieStorage.get('user_token');
		if (token) {
			this.convertCoupon(this.data.detail.code);
		} else {
			wx.showModal({
				content: '请先登录',
				showCancel: false,
                success: res => {
                    if (res.confirm || (!res.cancel && !res.confirm)) {
                        pageLogin(getUrl());
                    }
                }
			})
		}
	},
	// 领取优惠券接口
	convertCoupon(code) {
		var token = cookieStorage.get('user_token');
		wx.showLoading({
			title: "正在领取",
			mask: true
		});
		sandBox.post({
			api: 'api/coupon/convert',
			header: {
				Authorization: token
			},
			data: {
				coupon_code:code,
                agent_code: this.data.agent_code
			}
		}).then(res => {
			wx.hideLoading();
			if (res.statusCode == 200) {
				res = res.data;
				if (res.status) {
					this.setData({
						'detail.has_get': true
					})
					wx.showToast({
						title: '领取成功',
					});
				} else {
					wx.showToast({
						title: res.message || '领取失败',
						image: '../../../assets/image/error.png'
					})
				}
			} else {
				wx.showToast({
					title: '领取失败',
					image: '../../../assets/image/error.png'
				})
			}
		}).catch(rej => {
			wx.showToast({
				title: '领取失败',
				image: '../../../assets/image/error.png'
			})
			wx.hideLoading();
		})

	},
	// 查询优惠券详情
	queryCouponDetail(id) {
		wx.showLoading({
			title: "加载中",
			mask: true
		});

		var token = cookieStorage.get('user_token');
		sandBox.get({
			api: 'api/shitang/coupon/detail/' + id ,
			header: {
				Authorization: token
			}

		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        detail: res.data,
	                    init: true
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: "请求失败",
                    showCancel: false
                })
            }
			wx.hideLoading()
		}).catch(rej => {
			wx.hideLoading()
			wx.showModal({
				content: '请求失败',
				showCancel: false
			})
		})
	}
})