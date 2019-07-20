import {
    config,
    sandBox,
    cookieStorage
} from "../../../lib/myapp.js"
var app = getApp()

Page({
    data: {
        type: 0
    },
    selectCoupon(event) {
        this.setData({
            type: event.currentTarget.dataset.current
        })
    }
})
