/**
 * Created by admin on 2017/8/30.
 */
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
    changeDate(e) {
        this.setData({
            birthdaydate: e.detail.value
        })
    },

})
