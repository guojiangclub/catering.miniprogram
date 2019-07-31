import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        code: '',
        url: '',
        logo: '',
        author: config.PACKAGES.author,
        config: '',
        userInfo: '',
        phone: '',
        isChecked: true,
        userProtocol: '',
        login_page_bg: ''
    },
    onLoad(e){
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: bgConfig
        })
        if (e.url) {
            this.setData({
                url: decodeURIComponent(e.url)
            })
        }
        this.gettingUserProtocol();
    },
    onShow() {
        var token=cookieStorage.get('user_token');
        this.setData({
            token:token
        });

        var initInfo = cookieStorage.get('init');
        if (initInfo) {
            let title = initInfo.shop_name;

            wx.setNavigationBarTitle({
                title: title
            })
            this.setData({
                login_page_bg: initInfo.login_page_bg
            })
        } else {
            this.init();
        }
        if(token){
            wx.redirectTo({
                url: '/pages/index/index/index'
            })
        } else {
            this.wxLogin();
        }
    },
    changeCheck() {
      this.setData({
          isChecked: !this.data.isChecked
      })
    },
    init() {
        sandBox.get({
            api: 'api/system/init'
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    let title = res.data.shop_name;
                    wx.setNavigationBarTitle({
                        title: title
                    })
                    this.setData({
                        login_page_bg: res.data.login_page_bg
                    })
                }
            }
        })
    },
    jumpLink(e) {
        let url = this.data.userProtocol;
        if (!url) {
            wx.showModal({
                content: '地址为空',
                showCancel: false
            })
        } else {
            wx.navigateTo({
                url: '/pages/index/webView/webView?url=' + encodeURIComponent(url)
            })
        }
    },

    // 获取用户信息
    getUserInfo(e) {
        if (e.detail.iv) {
            this.setData({
                userInfo: e.detail.userInfo
            })
        }
    },
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
                        image: '../../../assets/image/error.png'
                    })
                }
            }
        })
    },
    getCode() {
        /*wx.login({
            success: res => {
                if (res.code) {
                    this.setData({
                        code: res.code
                    })
                } else {
                    wx.showModal({
                        content: " 获取code失败",
                        showCancel: false
                    })
                }
            }
        });*/
    },
    // 获取手机号
    getPhoneNumber(e) {
        if (e.detail.encryptedData) {
            wx.login({
                success: res => {
                    if (res.code) {
                        this.setData({
                            code: res.code
                        }, res => {
                            this.phone(e);
                        })
                    } else {
                        wx.showModal({
                            content: " 获取code失败",
                            showCancel: false
                        })
                    }
                }
            });
            return
        }
    },
// 获取手机号
    phone(e) {
        wx.showLoading({
            title: '正在获取手机号',
            mask: true
        })
        sandBox.get({
            api: 'api/shitang/authorizationMobile',
            data: {
                open_type:'miniprogram',
                code: this.data.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv,
                open_id: this.data.open_id,
                agent_code: cookieStorage.get('coupon_agent_code') || cookieStorage.get('agent_code') || '',
                agent_code_time: cookieStorage.get('agent_code_time') || '',
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        phone: res.data.mobile
                    }, () => {
                        this.submit();
                    })
                } else {
                    wx.showModal({
                        content: res.message || '请求失败，请重试',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: '请求失败，请重试',
                    showCancel: false
                })
            }
            wx.hideLoading();
        }).catch(rej => {
            wx.hideLoading();
            wx.showModal({
                content: '请求失败，请重试',
                showCancel: false
            })
        })
    },
    // 自动登录
    autoLogin(code) {
        sandBox.post({
            api: 'api/shitang/oauth/MiniProgramLogin',
            data: {
                code: code,
                open_type:'miniprogram',
                agent_code: cookieStorage.get('coupon_agent_code') || cookieStorage.get('agent_code') || '',
                agent_code_time: cookieStorage.get('agent_code_time') || '',
            },
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.data && res.data.open_id) {
                    this.setData({
                        open_id: res.data.open_id
                    })


                }
                // 如果接口返回token就直接登录，如果没有则弹出授权
                if (res.data.access_token) {
                    wx.hideLoading();
                    var access_token = res.data.token_type + ' ' + res.data.access_token;
                    var expires_in = res.data.expires_in || 315360000;
                    cookieStorage.set("user_token", access_token, expires_in);
                    if (this.data.url) {
                        wx.redirectTo({
                            url:"/"+this.data.url
                        })
                    } else {
                        wx.redirectTo({
                            url: '/pages/index/index/index'
                        })
                    }
                } else {
                    wx.hideLoading();
                }

            } else {
                wx.hideLoading();
                wx.showModal({
                    content:'请求失败，请重试',
                    showCancel: false,
                    success: res=>{
                        if (res.confirm || (!res.cancel && !res.confirm)) {
                            this.wxLogin();
                        }
                    }
                })
            }
        }).catch(rej => {
            wx.hideLoading();
            wx.showModal({
                content:'请求失败，请重试',
                showCancel: false,
                success: res=>{
                    if (res.confirm || (!res.cancel && !res.confirm)) {
                        this.wxLogin();
                    }
                }
            })
        })
    },
    // 获取会员章程
    gettingUserProtocol() {
      sandBox.get({
          api: 'api/shitang/GettingUserProtocol'
      }).then(res => {
          if (res.statusCode) {
              res = res.data;
              if (res.status) {
                  this.setData({
                      userProtocol: res.data.protocol
                  })
              } else {
                  wx.showModal({
                      content: res.message || '请求失败，请重试',
                      showCancel: false
                  })
              }
          } else {
              wx.showModal({
                  content: res.message || '请求失败，请重试',
                  showCancel: false
              })
          }
      })
    },
    // 登录
    submit() {
        let message = '';
        if (!this.data.isChecked) {
            message = '请同意会员章程'
        } else if (!this.data.phone) {
            message = '请授权手机号'
        }
        if (message) {
            wx.showModal({
                content:message,
                showCancel: false,
            })
        } else {
            wx.showLoading({
                title: '正在登录',
                mask: true
            })
            sandBox.post({
                api: 'api/shitang/oauth/register',
                data: {
                    mobile: this.data.phone,
                    open_id: this.data.open_id,
                    userInfo: '',
                    agnet_code: cookieStorage.get('agent_code') || ''
                }
            }).then(res => {
                if (res.statusCode == 200) {
                    res = res.data;
                    if (res.status) {
                        var access_token = res.data.token_type + ' ' + res.data.access_token;
                        var expires_in = res.data.expires_in || 315360000;
                        cookieStorage.set("user_token", access_token, expires_in);
                        if (this.data.url) {
                            wx.redirectTo({
                                url:"/"+this.data.url
                            })
                        } else {
                            wx.redirectTo({
                                url: '/pages/index/index/index'
                            })
                        }
                    } else {
                        wx.hideLoading();
                        wx.showModal({
                            content:res.message || '请求失败，请重试',
                            showCancel: false,
                        })
                    }
                    wx.hideLoading();
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        content:'请求失败，请重试',
                        showCancel: false,
                    })
                }
            })
        }
    }
})