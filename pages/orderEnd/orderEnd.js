const app = getApp()
Page({
  data: {
      star: 0,
      starMap: [
         '','','','','',
      ],
      play:'',
      
  },
  myStarChoose(e) {
      let star = parseInt(e.target.dataset.star) || 0;
      this.setData({
          star: star,
      });
  },
  onLoad(){
    // wx.getStorage({
    //   key:'driver',
    //   success: (res)=>{
    //       console.log(res.data)
    //       this.setData({
    //         driver:res.data
    //       })
    //   } 
    // })
  // console.log(app.globalData.play)
    // this.setData({
      // play: app.globalData.play
    // })
    console.log('乘客信息：', app.globalData.passengerInfo)
    console.log('订单信息：', app.globalData.currOrderInfo)
    let passengerInfo = app.globalData.passengerInfo
    let orderInfo = app.globalData.currOrderInfo
    var str = orderInfo.endLocation
    var arr = str.split(',')
    orderInfo.endLocation = arr[0]
    this.setData({
      passengerInfo: passengerInfo,
      orderInfo: orderInfo
    })
  },
  toIndex(){
        
    wx.showLoading({
      title: '提交中',
      icon: 'loading'
    })
    setTimeout(()=>{
      wx.redirectTo({
        url: '/pages/index/index',
      })
    },2000)
   
  }
});