


import {is,config,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data:{
        codes:{
            total:60,
            access_token:null,
            codeText:"获取验证码"
        },
        tellphone:"",
        identifyingcode:"",
        sending:false,
        checked:false,
        orginUrl:"",
        showLoading: false,
        message:"",
        open_id: '',
        brand: config.BRAND.name,
        author: config.PACKAGES.author,

        code: '',
        shop_id: '',
        unionInFo: '',
        openInFo: '',
        config: ''
    },
    changeChecked(e){
        // console.log(e);
        this.setData({
            checked:!this.data.checked
        })
    },
    changeCode(e){
        this.setData({
            tellphone: e.detail.value
        })
    },
    changeIdentifyCode(e){

        this.setData({
            identifyingcode: e.detail.value
        })
    },
    videoError(e) {
        console.log(e);
    },
    random(){
        return Math.random().toString(36).substr(2,24);
    },
    onLoad(e){
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
        this.setData({
            orginUrl:decodeURIComponent(e.url)
        });

        if (e.shop_id) {
            this.setData({
                shop_id: e.shop_id
            })
        }
        if (e.open_id) {
            this.setData({
                open_id: e.open_id
            })
        }
    },
    onShow() {
        // 是否开启自动登录
        /*if (!config.PACKAGES.autoLogin) {
            wx.login({
                success: res => {
                    if (res.code) {
                        this.autoLogin(res.code);
                    } else {
                        wx.showToast({
                            title: '获取code失败',
                            image: '../../../assets/image/error.png'
                        })
                    }
                }
            })
        }*/

        var token=cookieStorage.get('user_token');
        this.setData({
            token:token
        });
        if(token){
            wx.switchTab({
                url: '/pages/user/personal/personal'
            })
        }

    },
    getCode(){
        if(this.data.sending) return;
        var randoms=this.random();
        this.setData({
            sending:true,
            'codes.codeText':"短信发送中",
            'codes.access_token':randoms
        });
        var fn;
        fn=this.getLoginCode;
        fn(()=>{
            var total =this.data.codes.total;
            this.setData({
                'codes.codeText':total+"秒后再发送"
            });
            var timer =setInterval(()=>{
                total--;
                this.setData({
                    'codes.codeText':total+"秒后再发送"
                });
                if(total<1){
                    this.setData({
                        sending:false,
                        'codes.codeText':"获取验证码"
                    });
                    clearInterval(timer);
                }
            },1000);
        },()=>{
            this.setData({
                sending:false,
                'codes.codeText':"获取验证码"
            });
        });
    },
    getLoginCode(resolve,reject){
        var message =null;
        if(!is.has(this.data.tellphone)){
            message = "请输入您的手机号";
        } else if(!is.mobile(this.data.tellphone)){
            message = '手机号格式不正确，请重新输入';
        }
        if(message){
            this.setData({
                message:message
            });
            reject();
            setTimeout(()=>{
                this.setData({
                    message:""
                });
            },3000)
            return
        }
        sandBox.post({
            api:"api/sms/verify-code",

            data:{
                mobile:this.data.tellphone,
                access_token:this.data.codes.access_token
            },
        }).then(res =>{
            if(res.data.success){
                resolve();
            }
            else{
                reject();
            }
        })
        // resolve();
    },
    submit(){
        var message=null;
        if(!is.has(this.data.tellphone)){
            message = "请输入您的手机号";
        } else if(!is.mobile(this.data.tellphone)){
            message = '手机号格式不正确，请重新输入';
        } else if(!is.has(this.data.identifyingcode)){
            message="请填写验证码";
        } else if(!is.has(this.data.checked)){
            message="请同意此协议";
        }
        if(message){
            this.setData({
                message:message
            });
            setTimeout(()=>{
                this.setData({
                    message:""
                });
            },3000)
            return
        }
        this.setData({
            showLoading: true
        })
        this.quickLogin();
    },
    quickLogin(){
        var that=this;
        var data={
            grant_type: 'sms_token',
            access_token:that.data.codes.access_token,
            mobile:that.data.tellphone,
            code:that.data.identifyingcode,
            open_type:'miniprogram',
            open_id: this.data.open_id || '',
            shop_id: cookieStorage.get('shop_id') || '',
            agent_code: cookieStorage.get('coupon_agent_code') || cookieStorage.get('agent_code') || '',
            clerk_id: cookieStorage.get('clerk_id') || '',
            agent_code_time: cookieStorage.get('agent_code_time') || '',
            shop_id_time: cookieStorage.get('shop_id_time') || '',
        };
        sandBox.post({
            api:"api/v2/oauth/sms",
            data:data,
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.data.access_token) {
                    var result=res.data;
                    if(result.access_token){
                        result.access_token =result.token_type + ' ' + result.access_token;
                        var expires_in = result.expires_in || 315360000;
                        cookieStorage.set("user_token",result.access_token,expires_in);
                        // wx.setStorageSync("user_token",result.access_token);
                        if(this.data.orginUrl != 'undefined'){
                            console.log(this.data.orginUrl);
                            if(this.data.orginUrl.startsWith('pages/index/index/index')){
                                if(this.data.orginUrl=="pages/index/index/index"){
                                    getApp().globalData.giftLogin=false;
                                }
                                else{
                                    getApp().globalData.giftLogin=true;
                                }
                                wx.switchTab({
                                    url:"/"+this.data.orginUrl
                                })
                            }
                            else{
                                wx.redirectTo({
                                    url:"/"+this.data.orginUrl
                                })
                            }
                            // wx.redirectTo({
                            //     url:"/"+this.data.orginUrl
                            // })
                            // wx.switchTab({
                            //     url:"/"+this.data.orginUrl
                            // })
                        } else {
                            wx.switchTab({
                                url: '/pages/user/personal/personal'
                            })
                        }

                    }
                } else {
                    wx.showModal({
                        content: res.message || "验证码不正确",
                        showCancel: false
                    });
                }
            } else {
                wx.showModal({
                    content:  "请求失败",
                    showCancel: false
                });
            }
            /*if(res.statusCode==500){
                wx.showModal({
                    title:"提示",
                    content:"验证码不正确",
                });
            }
            else if(res.statusCode==200){
                var result=res.data;
                if(result.access_token){
                    result.access_token =result.token_type + ' ' + result.access_token;
                    var expires_in = result.expires_in || 315360000;
                    cookieStorage.set("user_token",result.access_token,expires_in);
                    // wx.setStorageSync("user_token",result.access_token);
                    if(this.data.orginUrl != 'undefined'){
                        console.log(this.data.orginUrl);
                        if(this.data.orginUrl.startsWith('pages/index/index/index')){
                            if(this.data.orginUrl=="pages/index/index/index"){
                                getApp().globalData.giftLogin=false;
                            }
                            else{
                                getApp().globalData.giftLogin=true;
                            }
                            wx.switchTab({
                                url:"/"+this.data.orginUrl
                            })
                        }
                        else{
                            wx.redirectTo({
                                url:"/"+this.data.orginUrl
                            })
                        }
                        // wx.redirectTo({
                        //     url:"/"+this.data.orginUrl
                        // })
                        // wx.switchTab({
                        //     url:"/"+this.data.orginUrl
                        // })
                    } else {
                        wx.switchTab({
                            url: '/pages/user/personal/personal'
                        })
                    }

                }

            }*/
            this.setData({
                showLoading: false
            })
        }).catch(rej =>{
            wx.showModal({
                content:  "请求失败",
                showCancel: false
            });
            this.setData({
                showLoading: false
            })
        })
    },
    autoLogin(code) {
        sandBox.post({
            api: 'api/mini/program/login',
            data: {
                code: code
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.data && res.data.open_id) {
                    this.setData({
                        open_id: res.data.open_id
                    })
                }
                if (res.access_token) {
                    var access_token = res.token_type + ' ' + res.access_token;
                    var expires_in = res.expires_in || 315360000;
                    // debugger;
                    cookieStorage.set("user_token",access_token,expires_in);
                    // cookieStorage.set("user_token",access_token,expires_in);
                    // wx.setStorageSync("user_token",access_token);
                    wx.switchTab({
                        url: '/pages/user/personal/personal'
                    })
                }
                if (!res.status) {
                    // wx.showToast({
                    //     title: res.message,
                    //     image: '../../../assets/image/error.png'
                    // })
                }
            } else {
                // wx.showToast({
                //     title: '获取信息失败',
                //     image: '../../../assets/image/error.png'
                // })
            }
        }).catch(rej =>{
            wx.showToast({
                title: '请求接口失败',
                image: '../../../assets/image/error.png'
            })
        })
    }

});
