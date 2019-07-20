Page({
    data: {
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        width: 0,
        tabList: [{
                title: "收入",
                init: false,
                page: 0,
                more: true,
            },
            {

                title: "支出",
                init: false,
                page: 0,
                more: true,
            }
        ],
        dataList: {
            0: [],
            1: []
        },
        point: {

        },
        config: ''
    },

})
