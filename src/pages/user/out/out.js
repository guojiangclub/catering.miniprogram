import {cookieStorage} from '../../../lib/myapp.js';
Page({
    jump(){
        wx.navigateTo({
            url: '/pages/user/usersetting/usersetting'
        })
    },
	data: {
		items: [
			{name: 'USA', value: '美国'},
			{name: 'CHN', value: '中国', checked: 'true'},
			{name: 'BRA', value: '巴西'},
			{name: 'JPN', value: '日本'},
			{name: 'ENG', value: '英国'},
			{name: 'TUR', value: '法国'},
		]
	},

	checkboxChange: function(e) {
		console.log('checkbox发生change事件，携带value值为：', e.detail.value)
	},

    onShow(){
        // let app =getApp();
        // app.isBirthday().then(()=>{
        //     if(cookieStorage.get("birthday_gift")){
        //         var giftData=cookieStorage.get("birthday_gift").data;
        //         new app.ToastPannel().__page.showText(giftData);
        //     }
        // });
    },
    logout(){
        cookieStorage.clear('user_token');
        cookieStorage.clear('birthday_gift');
        cookieStorage.clear('new_gift');
        cookieStorage.clear('gift_info');
        // wx.removeStorageSync('user_token');
        wx.showToast({
          title: '已成功注销该账户',
          duration:1500,
          mask:true,
          success(){
              setTimeout(()=>{
                  wx.switchTab({
                      url: '/pages/user/personal/personal'
                  })
              },1500)
          }
        })
    }
})