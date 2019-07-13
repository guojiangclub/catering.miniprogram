import {config,pageLogin,getUrl,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
	data: {
		list: [],
		order_no: '',
		url:''
	},
	onLoad(e) {
		console.log(e)
		pageLogin(getUrl());
		this.setData({
			order_no: e.order_no,
			url:e.url
		})
	},
	onShow() {
		this.queryAddressList();
        // let app =getApp();
        // app.isBirthday().then(()=>{
        //     if(cookieStorage.get("birthday_gift")){
        //         var giftData=cookieStorage.get("birthday_gift").data;
        //         new app.ToastPannel().__page.showText(giftData);
        //     }
        // });
	},
	setInfo(e) {
		var from = e.currentTarget.dataset.info;
		var data = cookieStorage.get('order_form');
		if (!data) {
			return this.view(from.id);
		}


		var order_no = this.data.order_no;
		if (order_no && data.order_no === order_no) {
			data.address  = from;
            cookieStorage.set('order_form', data);
			wx.navigateBack({
				url:'/'+this.data.url
			});
		} else {
			return this.view(from.id);
		}
	},
	view(id) {
		wx.navigateTo({
			url: '/pages/address/add/add?id=' + id
		})
	},
	add() {
		wx.navigateTo({
			url: '/pages/address/add/add'
		})
	},
	// 查询收货地址列表
	queryAddressList() {
		var token = cookieStorage.get('user_token');
		sandBox.get({
			api:  'api/address',
			header: {
				Authorization: token
			},

		}).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        list: res.data
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        image: '../../../assets/image/error.png'
                    })
                }

            } else {
                wx.showToast({
                    title: '获取信息失败',
                    image: '../../../assets/image/error.png'
                })
            }
		})
	}
})