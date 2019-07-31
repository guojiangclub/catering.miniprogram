import {
    config,
    sandBox,
    cookieStorage
} from "../../../lib/myapp.js"
var app = getApp()

Page({
    data: {
        type: 0,
        tabList:[
            {
                page:1,
                init:false,
                more:true,
                title:'我的优惠卷'
            },
            {
                page:1,
                init:false,
                more:true,
                title:'已使用/已过期'
            }

        ],
        dataList:{
            0:[],
            1:[]
        },
        initInfo:''
    },
    onLoad(e){
        let token = cookieStorage.get('user_token');
        if(token){
            this.queryCouponList(0,1);
        } else {
            wx.navigateTo({
                url:'/pages/user/register/register'
            })
        }
        this.init(e)
    },
    onShow(){

    },
    onReachBottom() {
        let type = this.data.type
        let page = this.data.tabList[type].page + 1;
        if (this.data.tabList[type].more) {
            this.queryCouponList(type,page);
        } else {
            wx.showToast({
                icon: 'none',
                title: '再拉也没有啦'
            });
        }
    },
    selectCoupon(event) {
        this.setData({
            type: event.currentTarget.dataset.current
        })
        if(!this.data.tabList[this.data.type].init){
            this.queryCouponList(this.data.type,1)
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
    // 查询优惠券列表
    queryCouponList(type,page) {
        wx.showLoading({
            title: "加载中",
            mask: true
        });
        let txt = '';
        if(type == 0){
            txt = 'active'
        } else if(type == 1){
            txt = 'invalid'
        }

        var token = cookieStorage.get('user_token') || '';
        sandBox.get({
            api: 'api/shitang/coupon/list',
            header: {
                Authorization: token
            },
            data: {
                page:page,
                type:txt
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
    jump(e){
        let id = e.currentTarget.dataset.id;
      wx.navigateTo({
          url:'/pages/coupon/onDetail/onDetail?id='+id
      })
    },
})
