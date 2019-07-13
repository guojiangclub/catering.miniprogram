import {config,sandBox,cookieStorage} from '../../../lib/myapp.js';

Page({
	data:{
		page: 1,
		list: [],
		meta: '',
		show: false,
		init: false,
		animationDate:{}
	},
	onLoad(){
		this.queryCouponList(0);
	},
    onShow(){

        var animation = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
        })

        this.animation = animation

        animation.rotate(-30).step()

        this.setData({
            animationData:animation.export()
        })
    },

	onReachBottom ()  {
		var hasMore = this.data.meta.pagination.total_pages > this.data.meta.pagination.current_page;
		if (hasMore) {
			var page = this.data.meta.pagination.current_page + 1;
			this.setData({
				show: true
			})
			this.queryCouponList(0, page)
		} else {
			wx.showToast({
				image: '../../../assets/image/error.png',
				title: '再拉也没有啦'
			});
		}
	},
	jumpOff() {
		wx.navigateTo({
            url: '/pages/coupon/over/over'
		})
	},
	// 查询优惠券列表
	queryCouponList(status, page = 1) {
		var token = cookieStorage.get('user_token');
        wx.showLoading({
            title: "加载中",
            mask: true
        });
		sandBox.get({
			api: 'api/shitang/coupon/list',
			header: {
				Authorization: token
			},
			data: {
                type: 'invalid',
				page
			},

		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        [`list[${page - 1}]`]: res.data,
                        meta: res.meta
                    })
                } else {
                    wx.showModal({
                        content: res.message,
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: "请求失败",
                    showCancel: false
                })
            }

            this.setData({
                show: false,
                init: true
            })
            wx.hideLoading()
		}).catch(rej =>{
            wx.hideLoading();
            this.setData({
                show: false,
                init: true
            })
		})
	}

})