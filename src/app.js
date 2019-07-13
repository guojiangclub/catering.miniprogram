/**
 * Created by admin on 2017/9/1.
 */
import {config,getUrl,pageLogin,sandBox,cookieStorage} from './lib/myapp.js';
App({
    onLaunch(e) {
       var referrerInfo = e.referrerInfo;
        if (referrerInfo.appId) {
           cookieStorage.set('referrerInfo', referrerInfo);
       }
        var token = cookieStorage.get('user_token');   // 确保缓存跟当前版本保持一致

        const updateManager = wx.getUpdateManager();

        updateManager.onCheckForUpdate(res => {
            if (res.hasUpdate) {
                wx.showLoading({
                    title: '正在更新，请稍后',
                    mask: true
                })
            }
        })
        updateManager.onUpdateReady(res => {
            wx.hideLoading();
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    if (res.confirm) {
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        updateManager.onUpdateFailed(err => {
            wx.showModal({
                title: '更新提示',
                content: '更新失败',
            })
        })
    },
    onShow(e){
        this.init();
	    var token=cookieStorage.get('user_token');
    },
	// 获取初始化数据
	init() {
    	sandBox.get({
    		api: 'api/system/init'
		}).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    cookieStorage.set('init_info', res.data.h5_share);
                    cookieStorage.set('service_info', res.data.online_service_data);
                    cookieStorage.set('distribution_valid_time', res.data.distribution_valid_time);
                    cookieStorage.set('init', res.data)
                }
            }
		})
	},
});