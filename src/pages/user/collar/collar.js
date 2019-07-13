import {config,getUrl,pageLogin,sandBox,cookieStorage} from '../../../lib/myapp.js';
Page({
    data: {
        is_show:true,
        info:'',
        sortReward:[],
        reward_id:'',
        reward:[],
        avatar:''
    },
    onLoad(){
        var toekn = cookieStorage.get('user_token');
        if (toekn) {
            this.getInfomation();
            this.getAvatar()
        } else {
            wx.navigateTo({
                url: '/pages/user/register/register?url=' + getUrl()
            })
        }

    },
    jumpImg(e) {
        var src = e.currentTarget.dataset.src

        wx.navigateTo({
            url: src
        })
    },
    //点击领取
    changes(e){
        if (this.data.info.is_sign){
            var reward_id = e.currentTarget.dataset.id;
            var index = e.currentTarget.dataset.index;
            this.getReward(reward_id,index);
        } else{
            wx.showModal({
                content: '请先签到',
                showCancel: false
            })
        }
        // debugger
    },
    //获取用户信息
    getInfomation(){
        var token=cookieStorage.get('user_token');
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        sandBox.get({
            api: 'api/sign/getSignReward',
            header:{
                Authorization:token
            },
        }).then(res =>{
            if (res.statusCode == 200){
                res = res.data;
                if(res.status){
                    if (!res.data.sign.get_reward) {
                        res.data.sign.sortReward.forEach(item => {
                            item.status= false
                        })
                    }
                    this.setData({
                        info:res.data,
                        reward:res.data.sign.sortReward
                    })
                    var newSortReward = this.data.info.sign.sortReward;//拿到后台给我的数组
                    newSortReward.splice(4,0, {//往数组里面添加文本
                        label: '每日签到',
                        text: '即可点击一次',
                        type: 'text'
                    });
                    this.setData({
                        sortReward:newSortReward
                    })
                } else{
                    wx.showModal({
                        content:res.message||"请求失败",
                        showCancel: false
                    })
                }
            } else{
                wx.showModal({
                    content:res.message||"请求失败",
                    showCancel: false
                })
            }
            wx.hideLoading();
        }).catch(res=>{
            wx.hideLoading();
            wx.showModal({
                content:"请求失败",
                showCancel: false
            })
        })
    },
    //签到动作
    getAction(){
        wx.showLoading({
            title: '正在签到',
            mask: true
        });
        var token=cookieStorage.get('user_token');
        sandBox.post({
            api: 'api/sign/doSign',
            data: {
                sign_id: this.data.info.sign.id
            },
            header:{
                Authorization:token
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    wx.showModal({
                        content:res.data.message||"签到成功",
                        showCancel: false,
                        success: res => {
                            if (res.confirm || (!res.cancel && !res.confirm)) {
                                this.getInfomation();//签到成功重新请求数据
                            }
                        }
                    })
                } else {
                    wx.showModal({
                        content:res.message || '签到失败',
                        showCancel: false
                    })
                }
            } else {
                wx.showModal({
                    content: '签到失败',
                    showCancel: false
                })
            }
            wx.hideLoading();
        }).catch(res=>{
            wx.hideLoading();
            wx.showModal({
                content:'请求失败',
                showCancel: false
            })
        })
    },
    //点击签到领积分
    getSign(){
        this.getAction();
    },
    //领取签到奖品
    getReward(reward_id, index){
        var token=cookieStorage.get('user_token');
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        sandBox.post({
            api: 'api/sign/doDraw',
            data: {
                // sign_id: this.data.info.sign.id
                reward_id:reward_id,
                sign_reward:this.data.reward
            },
            header:{
                Authorization:token
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        'info.sign.get_reward': true,
                        [`sortReward[${index}].status`]: true
                    });
                    var item = this.data.sortReward[index];
                    if (item.type == 'point') {
                        this.setData({
                            'info.point': Number(this.data.info.point) + item.type_value
                        })
                    }

                } else {
                    wx.showModal({
                        content:res.message || '请求失败',
                        showCancel: false
                    })
                }
            } else{
                wx.showModal({
                    content:res.message || '请求失败',
                    showCancel: false
                })
            }
            wx.hideLoading();
        }).catch( res=>{
            wx.hideLoading();
            wx.showModal({
                content:"请求失败",
                showCancel: false
            })
        })
    },
    jumpdetail(e){
        var id = e.currentTarget.dataset.id;
        var type = e.currentTarget.dataset.type;

        if (type == 0) {
            wx.navigateTo({
                url:`/pages/store/detail/detail?id=${id}`
            })
        } else {
            wx.navigateTo({
                url:`/pages/pointStore/detail/detail?id=${id}`
            })
        }

    },
    //获取头像
    getAvatar(){
        wx.showLoading({
            title: '正在获取头像',
            mask: true
        });
        var token=cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/me',
            header:{
                Authorization:token
            },
        }).then(res =>{
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        avatar:res.data.avatar
                    })
                } else {
                    wx.showModal({
                        content:res.message || '获取头像失败',
                        showCancel: false
                    })
                }
            }
            wx.hideLoading();
        }).catch(res=>{
            wx.hideLoading();
            wx.showModal({
                content:'请求失败',
                showCancel: false
            })
        })
    }

})

