var app = getApp();

import {
    config,
    pageLogin,
    sandBox,
    getUrl,
    cookieStorage
} from '../../../lib/myapp.js';

Page({
    data: {
        config: '',
        token: '',
        userInfo: ''

    },
    onShareAppMessage(res) {
        var info = cookieStorage.get('init_info');
        let path = this.data.userInfo && this.data.userInfo.agent_code ? `/${this.route}?agent_code=${this.data.userInfo.agent_code}` : `${this.route}`;
        console.log('这个是分享出去的链接', path);
        return {
            title: info.title,
            path: path,
            imageUrl: info.imgUrl
        }
    },
    onLoad(e) {
        // 第三方平台配置颜色
        var gbConfig = cookieStorage.get('globalConfig') || '';
        this.setData({
            config: gbConfig,
        })
        if (!gbConfig) {
            let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
            if (extConfig) {
                this.setData({
                    config: extConfig,
                })
            }
        }
        wx.getSystemInfo({
            success: res => {
                this.setData({
                    screenWidth: res.screenWidth
                })
            }
        });
        this.init(e);
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
        var agent_code = e.agent_code || '';
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
        const code = agent_code || cookieStorage.get('agent_code');
        if (code) {
            // this.getCodeUser(code);
        }

    },

    // 获取用户信息
    getUserInfo(e) {
        if (e.detail.iv) {
            this.setData({
                userInfo: e.detail.userInfo
            })
        }
        console.log('这个是获取到的用户信息', e);
    },
    // 获取用户手机号
    getPhoneNumber(e) {
        if (e.detail.iv) {

        }
        console.log('这个是获取到的手机号', e);
    },
    jumpAuthor() {
        wx.navigateTo({
            url: '/pages/index/author/author'
        });
    },
    imgLoad(e) {
        var height = e.detail.height
        var width = e.detail.width;
        var ratio = width / height;
        var screenWidth = this.data.screenWidth;
        this.setData({
            imgHeight: screenWidth / ratio
        })
    }
});
