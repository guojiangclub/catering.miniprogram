Component({
    properties: {
        size: {
            type: [String, Number],
            value: 15
        },
        star: {
            type: String,
            value: '★'
        },
        /*min: {
            type: [String, Number],
            value: 1

        },
        max: {
            type: [String, Number],
            value: 5
        },*/
        value: {
            type: [String, Number],
            value: 5
        },
        disabled: {
            type: Boolean,
            value: false
        },
        defaultColor: {
            type: String,
        },
        activeColor: {
            type: String
        }
    },
    data: {
        colors: [],
        cutIndex: -1,
        cutPercent: 0,
        max: [
            {},
            {},
            {},
            {},
            {}
        ]
    }
})