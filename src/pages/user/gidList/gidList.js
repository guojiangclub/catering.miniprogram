import {config, getUrl, pageLogin, sandBox, cookieStorage} from '../../../lib/myapp.js';

Page({
    onLoad(e) {
        this.getGidList();
    },
    data: {
        list: []
    },
    getGidList() {
        var token = cookieStorage.get('user_token');
        sandBox.get({
            api: 'api/group/list',
            header: {
                Authorization: token
            },
            data: {
                limit: 1000
            }
        }).then(res => {
            if (res.statusCode == 200) {
                res = res.data;
                if (res.status) {
                    this.setData({
                        list: res.data
                    })
                } else {}

            } else {

            }
        })
    }
})