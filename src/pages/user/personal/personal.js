/**
 * Created by admin on 2017/9/1.
 */
var app = getApp();

import {config,getUrl,pageLogin,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data:{
         detail:"",
        newdetail:"",
         token:"",
	    code: '',
	    shop_id: '',
	    unionInFo: '',
	    openInFo: '',
		init: false,
		config: '',
        author: '',
        initInfo: '',
        accountInfo: '',
        accountInfoInit: false,
        top: 13,
        bottom: '-13px'
    },
    onShow(){

        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        var initInfo = cookieStorage.get('init');

        this.setData({
            config: bgConfig,
            initInfo: initInfo,
            author: initInfo && initInfo.other_technical_support ? initInfo.other_technical_support : ''
        })
        if (!bgConfig) {
            let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync(): {};
            if (extConfig) {
                this.setData({
                    config: extConfig,
                })
            }
        }

        var token=cookieStorage.get('user_token');
        this.setData({
            token:token
        });
         if(token){
             this.getUserInfo();
             this.getCenter();

             if (this.data.code) {
                 wx.checkSession({
                 	success: res => {
                 		if (res.errMsg != 'checkSession:ok') {
                            this.getCode();
						}
                    }
				 })
			 } else {
                 this.getCode();
			 }


         }

        // console.log(getCurrentPages());
    },
    onLoad(e){
        var accountInfo = wx.getAccountInfoSync();
        this.setData({
            accountInfo: accountInfo,
            accountInfoInit: true
        })
        this.init(e);
    },
    // 获取初始化数据
    init(e) {
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
                    if (res.data && res.data.other_technical_support) {
                        this.setData({
                            author: res.data.other_technical_support
                        })
                    }
                    cookieStorage.set('init_info', res.data.h5_share);
                    cookieStorage.set('service_info', res.data.online_service_data);
                    cookieStorage.set('distribution_valid_time', res.data.distribution_valid_time);
                    cookieStorage.set('init', res.data);
                    this.setCode(e);
                    if (agent_code && res.data.mini_program_login_type == 'default' && !token){
                        wx.showLoading({
                            title: '正在自动登录',
                            mask: true
                        })
                        wx.login({
                            success: res => {
                                if (res.code) {
                                    app.autoLogin(res.code, agent_code)
                                        .then(res => {
                                            if (res.status) {
                                                if (res.data.access_token) {
                                                    var access_token = res.data.token_type + ' ' + res.data.access_token;
                                                    this.setData({
                                                        is_login: access_token
                                                    })
                                                }
                                                if (res.data.open_id) {
                                                    wx.reLaunch({
                                                        url: '/pages/user/agentlogin/agentlogin?agent_code=' + agent_code + '&open_id=' + res.data.open_id + '&url=' + getUrl() + '&is_tab=true'
                                                    })
                                                }
                                            }
                                            wx.hideLoading();
                                        }, err => {
                                            wx.hideLoading();
                                        })
                                } else {
                                    wx.showToast({
                                        title: '获取code失败',
                                        icon:'none'
                                    })
                                }
                            }
                        })
                    }
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
        var clerk_id = e.clerk_id || "";
        var shop_id = e.shop_id || "";
        var agent_code = e.agent_code||  '';
        if (e.scene) {
            var scene = decodeURIComponent(e.scene);
            var sceneArr = scene.split(',');
            if (sceneArr.length > 0) {
                agent_code = sceneArr[0]
            }
        }
        var cook_shop_id = cookieStorage.get('shop_id');
        if (!cookieStorage.get('distribution_valid_time')) {
            valid_time = 10080;
        } else {
            valid_time = cookieStorage.get('distribution_valid_time');
        }

        console.log('这个是时间', valid_time);
        let timeStamp = new Date().getTime();
        timeStamp += timeMap.n * valid_time;

        // 当url上shop_id与缓存中shop_id不一致时，需要清除clerk_id。以此保证shop_id与clerk_id对应
        var cook_clerk_id = cookieStorage.get('clerk_id');
        if (cook_shop_id != shop_id && cook_clerk_id) {
            cookieStorage.clear('clerk_id');
        }

        if (agent_code) {
            cookieStorage.set('agent_code', agent_code, valid_time + 'n');
            // 如果有agent_code就将这次进入的时间缓存
            cookieStorage.set('agent_code_time', timeStamp, valid_time + 'n');

            // 如果有agent_code并且有coupon_agent_code就将coupon_agent_code清除，保证agent_code为第一位
            if (cookieStorage.get('coupon_agent_code')) {
                cookieStorage.clear('coupon_agent_code')
            }
        }

        if (clerk_id) {
            cookieStorage.set('clerk_id', clerk_id, valid_time + 'n');
        }

        if (shop_id) {
            cookieStorage.set('shop_id', shop_id, valid_time + 'n');
            // 如果有shop_id就将这次进入的时间缓存
            cookieStorage.set('shop_id_time', timeStamp, valid_time + 'n');
        }
    },
    jumpAuthor() {
        wx.navigateTo({
            url:'/pages/index/author/author'
        });
    },
	getCode() {
    	wx.login({
    		success: res => {
    			if (res.code) {
    				this.setData({
    					code: res.code
					})
				}
			}
		})
	},
	jumpItem(e) {
		if(!this.data.token){
			return this.jumpLogin();
		}
		var url = e.currentTarget.dataset.url;
		wx.navigateTo({
			url: url
		})
	},
    jumpLogin(){
        wx.navigateTo({
            url: '/pages/user/register/register'
        })
    },
    jumpPhone(){
        wx.navigateTo({
            url: '/pages/user/phone/phone'
        })
    },
    jumpFavor(){
	    if(!this.data.token){
		    return this.jumpLogin();
	    }
        wx.navigateTo({
            url: '/pages/favorite/index/index'
        })
    },
	jumpPoint(){
		if(!this.data.token){
			return this.jumpLogin();
		}
        wx.navigateTo({
            url: '/pages/pointStore/index/index'
        })
    },
    jumpTravel(){
        if(!this.data.token){
            return this.jumpLogin();
        }
        wx.navigateTo({
            url: '/pages/travels/myTravel/myTravel'
        })
    },
    getUserInfo() {
        sandBox.get({
            api: 'api/me',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
        }).then(res =>{
            if(res.data.status){
                if (!res.data.data.mobile || !res.data.data.user_info_fill) {
                    this.setData({
                        top: 0,
                        bottom: '5px'
                    })
                }
                this.setData({
                    detail:res.data.data,
                    init: true
                })
            }
        })
    },
    jumpAddress(){
        if(!this.data.token){
            return this.jumpLogin();
        }
        wx.navigateTo({
            url: '/pages/address/list/list'
        })
    },
    jumpComment(){
        if(!this.data.token){
            return this.jumpLogin();
        }
        wx.navigateTo({
            url: '/pages/order/comment/comment'
        })
    },
    jumpCollar(){
        if(!this.data.token){
            return this.jumpLogin();
        }
        wx.navigateTo({
            url: '/pages/user/collar/collar'
        })
	},
    jumpBalance(){
        if(!this.data.token){
            return this.jumpLogin();
        }
        wx.navigateTo({
            url: '/pages/recharge/balance/balance'
        })
    },
    jumpNews(){
        if(!this.data.token){
            return this.jumpLogin();
        }
        wx.navigateTo({
            url: '/pages/user/news/news'
        })
    },
	jumpCan() {
		wx.navigateTo({
			url: '/pages/entity/index/index?shop_id=1'
		})
	},
	jumpDetail() {
		wx.navigateTo({
			url: '/pages/entity/detail/detail?id=1447&shop_id=1'
		})
	},
    jumpVip(){
        if(!this.data.token){
            return this.jumpLogin();
        }
        var svip = this.data.initInfo.vip_plan_status;
        var isSvip = this.data.detail.vip;
        if (svip == 1) {
            if (isSvip) {
                wx.navigateTo({
                    url: '/pages/user/svip/svip'
                })
            } else {
                wx.navigateTo({
                    url: '/pages/recharge/index/index'
                })
            }
        } else {
            wx.navigateTo({
                url: '/pages/card/index/index'
            })
        }

    },
    jumpImg() {
        if(!this.data.token){
            return this.jumpLogin();
        }
        wx.navigateTo({
            url: '/pages/user/usersetting/usersetting'
        })
    },
    jump(e){
        if(!this.data.token){
            return this.jumpLogin();
        }
        var status=e.currentTarget.dataset.status;
        wx.navigateTo({
            url: '/pages/order/index/index?type='+status
        })
    },
    jumpAfterSales(){
        if(!this.data.token){
            return this.jumpLogin();
        }
        wx.navigateTo({
            url: '/pages/afterSales/index/index'
        })
    },
    jumpSetting(){
        if(!this.data.token){
            return this.jumpLogin();
        }
        wx.navigateTo({
            url: '/pages/user/out/out'
        })
    },
    bindUserInfo(e) {
        if (e.detail.encryptedData) {
            e.detail.code = this.data.code;
            this.updateUserInfo(e.detail)
		}
	},
	updateUserInfo(data) {
        wx.showLoading({
            title: '更新中',
            mask: true
        })
    	sandBox.get({
    		api: 'api/user/bindUserMiniInfo',
			data: data,
            header:{
                Authorization:cookieStorage.get('user_token')
            }
		}).then(res => {
			if (res.statusCode == 200) {
				res = res.data;
				if (res.status) {
					this.getUserInfo();
				} else {
                    wx.showModal({
                        content: res.message || '请求失败',
                        showCancel: false
                    })
					this.getCode();
				}
                wx.hideLoading();
			} else {
				wx.showModal({
					content: '请求失败',
					showCancel: false
				})
				this.getCode();
                wx.hideLoading();
			}
        })
	},
    //获取页面信息
    getCenter(){
        var token=cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/users/ucenter',
            header:{
                Authorization:token
            },
        }).then(res =>{
            if(res.data.status){
                this.setData({
                    newdetail:res.data.data
                })
            }
        })
    }
})
