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
        balance:'',
        dataList:[],
        page:1,
        more:true,
        init:false


    },
    onLoad(e){
        setTimeout(() => {
            let initInfo = cookieStorage.get('init');
            this.setData({
                initInfo: initInfo
            })
        }, 500)
        let token = cookieStorage.get('user_token');
        if(token){
            this.queryUserSum();
            this.queryBalanceList(1)
            this.getUserInfo();
        } else {
            wx.navigateTo({
                url:'/pages/user/register/register'
            })
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
    onReachBottom(){
      if(this.data.more){
          let page = this.data.page + 1;
          this.queryBalanceList(page)
      } else {
          wx.showToast({
              icon: 'none',
              title: '再拉也没有啦'
          });
      }
    },
    queryUserSum(){
        wx.showLoading({
            mask: true,
            content: '加载中'
        });
        sandBox.get({
            api:"api/users/balance/sum",
            header:{
                Authorization:cookieStorage.get('user_token')
            }
        }).then(res=>{
            if(res.statusCode ==200){
                res=res.data;
                this.setData({
                    balance:res.data.sum
                })
            }else{
                wx.showModal({
                    title: '提示',
                    content: '数据请求失败',
                    success: res=>{

                    }
                })
            }
            wx.hideLoading();
    })
    },
    jumpBill(){
        wx.navigateTo({
            url:'/pages/recharge/index/index'
        })
    },
    queryBalanceList(page){
        sandBox.get({
            api:'api/users/balance/list',
            header:{
                Authorization:cookieStorage.get('user_token')
            },
            data:{
                page:page
            }
        }).then(res=>{
            if(res.statusCode ==200){
                res=res.data;
                if(res.status){
                    let pages = res.meta.pagination;
                    let current_page = pages.current_page;
                    let total_pages = pages.total_pages;
                    this.setData({
                        [`dataList[${page-1}]`]:res.data,
                        page:current_page,
                        more:current_page<total_pages,
                        init:true
                    })

                }
            }
            else{
                wx.showModal({
                    title: '提示',
                    content: '数据请求失败',
                    success: res=>{

                    }
                })
            }
            wx.hideLoading()
        }).catch(rej=>{
            wx.showToast({
                title: "请求失败",
                icon: 'none'
            })
            wx.hideLoading()
        })
    },
})