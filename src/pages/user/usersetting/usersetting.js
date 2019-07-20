/**
 * Created by admin on 2017/8/30.
 */
import {
    config,
    is,
    getUrl,
    pageLogin,
    sandBox,
    cookieStorage
} from '../../../lib/myapp.js';

Page({
    data: {
        list: [
            '男',
            '女',
        ],
        selectedIndex: "",
        detail: "",
        birthdaydate: '',
        QQnum: '',
        mobileNum: "",
        emailSet: "",
        config: ''
    },
    onLoad() {
        // 第三方平台配置颜色
        var bgConfig = cookieStorage.get('globalConfig') || '';
        var initData = cookieStorage.get('init');
        this.setData({
            config: bgConfig,
            initData: initData
        })
        Date.prototype.format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        };
        var time = new Date().format("yyyy-MM-dd");
        this.setData({
            end: time
        });
    },
    change: function (e) {
        // console.log(e);
        // 修改选中项文案
        this.setData({
            selectedIndex: e.detail.value
        })
    },
    changeName(e) {
        this.setData({
            'detail.nick_name': e.detail.value
        })
    },
    changeDate(e) {
        this.setData({
            birthdaydate: e.detail.value
        })
    },
    changeQQ(e) {
        this.setData({
            QQnum: e.detail.value
        })
    },
    changeB() {
        wx.showModal({
            content: '暂时无法修改',
            showCancel: false
        })
    },
    changeMobile() {
        wx.navigateTo({
            url: '/pages/user/bindingphone/bindingphone'
        })
    },
    changeEmail(e) {
        this.setData({
            emailSet: e.detail.value
        })
    },
    onShow() {
        pageLogin(getUrl(), () => {
            this.gitUserInfo()
        });
        // let app =getApp();
        // app.isBirthday().then(()=>{
        //     if(cookieStorage.get("birthday_gift")){
        //         var giftData=cookieStorage.get("birthday_gift").data;
        //         new app.ToastPannel().__page.showText(giftData);
        //     }
        // });
    },
    gitUserInfo() {
        sandBox.get({
            api: 'api/me',
            header: {
                Authorization: cookieStorage.get('user_token')
            },
        }).then(res => {
            if (res.data.status) {
                var sex = res.data.data.sex;
                var index = this.data.list.findIndex((val) => {
                    return val == sex
                });
                if (index == -1) index = "";
                var isChangeB = true;
                if (this.data.initData.vip_plan_status == 1 && res.data.data.birthday != '') {
                    isChangeB = false
                }
                this.setData({
                    detail: res.data.data,
                    selectedIndex: index,
                    birthdaydate: res.data.data.birthday,
                    QQnum: res.data.data.qq,
                    mobileNum: res.data.data.mobile,
                    emailSet: res.data.data.email,
                    isChangeB: isChangeB
                })
            }
        })

    },
    changeImage: function () {
        wx.chooseImage({
            count: 1,
            success: res => {
                var tempFilePaths = res.tempFilePaths;
                var token = cookieStorage.get('user_token');
                sandBox.uploadFile({
                    header: {
                        'content-type': 'multipart/form-data',
                        Authorization: token
                    },
                    api: 'api/users/upload/avatar', //仅为示例，非真实的接口地址
                    filePath: tempFilePaths[0],
                    name: 'avatar_file',
                }).then(res => {
                    var result = JSON.parse(res.data);
                    console.log(result);
                    this.setData({
                        'detail.avatar': result.data.url
                    });
                })

                // uploadTask.onProgressUpdate((res) => {
                //     wx.showLoading({
                //         title: "上传中",
                //         mask: true
                //     });
                // })
            }
        })
    },
    updateUserInfo() {
        var message = null;
        if (!this.data.detail.nick_name) {
            message = "请填写用户昵称";
        } else if (this.data.emailSet != "" && !is.email(this.data.emailSet)) {
            message = "请填写正确的邮箱";
        } else if (!this.data.birthdaydate) {
            message = "请选择出生日期";
        }
        if (message) {
            wx.showModal({
                content: message,
                showCancel: false
            });
            return
        }

        // this.updateBirthday();



        sandBox.post({
            api: 'api/users/update/info',
            header: {
                Authorization: cookieStorage.get('user_token')
            },

            data: {
                nick_name: this.data.detail.nick_name,
                sex: this.data.list[this.data.selectedIndex],
                avatar: this.data.detail.avatar,
                birthday: this.data.birthdaydate,
                qq: this.data.QQnum,
                email: this.data.emailSet
            },
        }).then(res => {
            console.log(res);
            if (res.statusCode == 200) {
                wx.showToast({
                    title: res.data.message,
                    duration: 1500,
                    success: () => {
                        setTimeout(() => {
                            wx.switchTab({
                                url: '/pages/user/personal/personal'
                            })
                        }, 1500);
                    }
                })
            } else {
                wx.showModal({
                    title: "提示",
                    content: "修改失败",
                });
            }
        })
    },
    updateBirthday() {
        sandBox.post({
            api: 'api/uto/update/birthday\n',
            header: {
                Authorization: cookieStorage.get('user_token')
            },
            data: {
                birthday: this.data.birthdaydate
            },
        }).then(res => {
            console.log(res);
        })
    }
})
