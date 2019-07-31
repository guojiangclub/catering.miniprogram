import {
	config,
	sandBox,
	pageLogin,
	getUrl,
	cookieStorage
} from '../../../lib/myapp.js';

Page({
	data: {
		detail: '',
		init: false,
		initInfo:'',
		userInfo:'',
        intro: ''
	},
	onLoad(e){
		this.init(e)
		let id = e.id;
		if(id) {
            this.queryCouponDetail(id);
            this.getUserInfo();
        }
	},
	// 获取初始化数据
	init(e) {
		console.log('获取到的e', e);
		var token = cookieStorage.get('user_token');
		var agent_code = '';
		if (e.agent_code) {
			agent_code = e.agent_code
		}
		if (e.scene) {
			var scene = decodeURIComponent(e.scene);
			var sceneArr = scene.split(',');
			if (sceneArr.length > 0) {
				agent_code = sceneArr[1]
			}
		}
		sandBox.get({
			api: 'api/system/init'
		}).then(res => {
			if (res.statusCode == 200) {
				res = res.data;
				if (res.status) {
					this.setData({
						initInfo: res.data
					})
					cookieStorage.set('init_info', res.data.h5_share);
					cookieStorage.set('service_info', res.data.online_service_data);
					cookieStorage.set('distribution_valid_time', res.data.distribution_valid_time);
					cookieStorage.set('init', res.data);
					this.setCode(e);
				} else {
					this.setCode(e);
				}
			} else {
				this.setCode(e);
			}
		})
	},
	setCode(e) {
		const timeMap = {
			y: 31536000000,
			m: 2592000000,
			d: 86400000,
			h: 3600000,
			n: 60000,
			s: 1000
		};

		// 默认有效期为7天
		var valid_time = "";
		var agent_code = e.agent_code || '';
		if (e.scene) {
			var scene = decodeURIComponent(e.scene);
			var sceneArr = scene.split(',');
			if (sceneArr.length > 0) {
				agent_code = sceneArr[0]
			}
		}
		if (!cookieStorage.get('distribution_valid_time')) {
			valid_time = 10080;
		} else {
			valid_time = cookieStorage.get('distribution_valid_time');
		}
		console.log('这个是时间', valid_time);

		let timeStamp = new Date().getTime();
		timeStamp += timeMap.n * valid_time;


		if (agent_code) {
			cookieStorage.set('agent_code', agent_code, valid_time + 'n');
			// 如果有agent_code就将这次进入的时间缓存
			cookieStorage.set('agent_code_time', timeStamp, valid_time + 'n');

			// 如果有agent_code并且有coupon_agent_code就将coupon_agent_code清除，保证agent_code为第一位
			if (cookieStorage.get('coupon_agent_code')) {
				cookieStorage.clear('coupon_agent_code')
			}
		}

	},
	// 获取用户信息
	getUserInfo() {
		sandBox.get({
			api: 'api/shitang/me',
			header:{
				Authorization:cookieStorage.get('user_token')
			},
			data:{
				includes:'group'
			}
		}).then(res =>{
			if(res.data.status){
				this.setData({
					userInfo:res.data.data
				})
			} else {
				wx.showModal({
					content: res.message || "获取数据失败",
					showCancel: false,
				})
			}
		})
	},
	// 查询优惠券详情
	queryCouponDetail(id) {
		wx.showLoading({
			title: "加载中",
			mask: true
		});

		let token = cookieStorage.get('user_token');
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
                    if (res.data.intro) {
                    	let intro = '';
                        let arr = res.data.intro.split("\n")
                        arr.forEach(item => {
                            intro += '<view>' + item + '</view>'
						})
                        console.log(intro);
                        this.setData({
                            intro: intro
						})
                    }
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
