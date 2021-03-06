import {config,pageLogin,sandBox,getUrl,cookieStorage} from '../../lib/myapp.js';
Component({
    //组件的对外属性，是属性名到属性设置的映射表
    properties:{
        callData:{
            type:Array,
            value:''
        },
        isLogin:{
            type:Boolean,
            value:''
        },
        config:{
            type:String,
            value:''
        },
        server:{
            type:String,
            value:''
        }

    },
    //组件的内部数据，和properties 一同用于组件的模板渲染
    data:{


    },
    //组件数据字段监听器，用于监听properties 和 data的变化
    observers:{

    },
    //组件的方法
    methods:{
        _jumpImg(e){
            var src = e.currentTarget.dataset.src;
            if (!src || src == 'uto_miniprogram') return

            wx.navigateTo({
                url: src
            })
        },
        _jumpCall(e) {
            if (this.data.isLogin) {
                var id = e.currentTarget.dataset.id

                wx.navigateTo({
                    url: '/pages/store/call/call?id=' + id
                })

            } else {
                wx.showModal({
                    content: '请先登录',
                    success: res => {
                        if (res.confirm || (!res.cancel && !res.confirm)) {
                            pageLogin(getUrl());
                        }
                    }
                })
            }

        }

    },
})