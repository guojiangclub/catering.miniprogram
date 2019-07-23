var app = getApp();

import {
    config,
    pageLogin,
    sandBox,
    getUrl,
    cookieStorage
} from '../../../lib/myapp.js';

Page({
    data:{
        point:''

    },
    onLoad(){
        this.queryUserPoint('default')

    },
    onShow(){

    },
    // 查询用户积分
    queryUserPoint(type) {
        let token = cookieStorage.get('user_token');

        sandBox.get({
            api:'api/users/point',
            header:{
                Authorization:token
            },
            data:{
                type: type
            }
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                this.setData({
                    point: res
                })
            } else {
                wx.showModal({
                    content: '请求失败',
                    showCancel: false
                })
            }
        })

    },
})
