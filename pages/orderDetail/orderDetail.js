const app = getApp()
Page({
  data: {
    star: 0,
    starMap: [
      '', '', '', '', '',
    ],
    play: '',
    id: 0,
    time: '',
    startLocation: '',
    endLocation: ''
  },
  myStarChoose(e) {
    let star = parseInt(e.target.dataset.star) || 0;
    this.setData({
      star: star,
    });
  },
  onLoad() {
    console.log('乘客信息：', app.globalData.passengerInfo)
    console.log('订单信息：', app.globalData.currOrderInfo)
    let passengerInfo = app.globalData.passengerInfo
    let orderInfo = app.globalData.currOrderInfo
    var str1 = orderInfo.startLocation
    var arr1 = str1.split(',')
    // console.log('arr[0]:',arr[0])
    orderInfo.startLocation = arr1[0]
    var str2 = orderInfo.endLocation
    var arr2 = str2.split(',')
    // console.log('arr[0]:',arr[0])
    orderInfo.endLocation = arr2[0]

    orderInfo.startTime = this.startTimeFormat(orderInfo.startTime)
    orderInfo.endTime = this.endTimeFormat(orderInfo.endTime)

    this.setData({
      passengerInfo: passengerInfo,
      orderInfo: orderInfo
    })
  },
  // 开始时间格式化
  startTimeFormat(e) {
    var time = e;
    var d = new Date(time);
    var times = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    return times;
  },
  // 结束时间格式化
  endTimeFormat(e) {
    var time = e;
    var d = new Date(time);
    var times = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    return times;
  },
  toIndex() {

    wx.showLoading({
      title: '提交中',
    })
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/index/index',
      })
    }, 2000)

  },
  // 拨打电话
  calling: function () {
    var that = this;
    // wx.request({
    //   url: '',
    //   method: 'GET',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   success: function (res) {
    //     that.setData({
    //       phone: res.data.phone
    //     })
    //   }
    // })
    wx.makePhoneCall({
      // phoneNumber: this.phone,
      phoneNumber: app.globalData.passengerInfo.passengerPhoneNumber,
      success: function () {
        console.log("拨打电话成功")
      },
      fail: function () {
        console.log("拨打电话失败")
      }
    })
  }
});