import {
	config,
	sandBox,
	pageLogin,
	getUrl,
	cookieStorage
} from '../../../lib/myapp.js';

Page({
	data: {
		detail: '',
		is_coupon: 1, // 用于判断是否为优惠券 1：优惠券 0：促销折扣
		init: false,
		agent_code: '',
		config: ''
	},
})
