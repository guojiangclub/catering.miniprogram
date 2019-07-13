import {config,pageLogin,sandBox,getUrl,cookieStorage} from '../../../lib/myapp.js';
Page({
    data:{
        url:''

    },
    onLoad(e){
        if(e.url){
            this.setData({
                url:decodeURIComponent(e.url)
            })
        } else {
            if(e.id){
                this.getServiceDetail(e.id)
            }
        }
    },
    //获取客服详情页接口
    getServiceDetail(id){
        wx.showLoading({
            title:'加载中',
            mask:true
        });
        sandBox.get({
            api:'api/grand/services/detail/'+id,
            data:{
            }
        }).then(res=>{
            if (res.statusCode == 200){
                res = res.data;
                if (res.status){
                    this.setData({
                        url: res.data.url,
                        // detail:res.data
                    })
                } else {
                    wx.showModal({
                        content:res.message || '服务器开了小差，请重试',
                        showCancel:false
                    })
                }
            } else {
                wx.showModal({
                    content:res.message || '服务器开了小差，请重试',
                    showCancel:false
                })
            }
            wx.hideLoading();
        }).catch(rej=>{
            wx.showModal({
                content:'服务器开了小差，请重试',
                showCancel:false
            })
            wx.hideLoading();
        })
    },
})