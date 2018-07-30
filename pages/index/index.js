import util from '../../utils/index';
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
qqmapsdk = new QQMapWX({
  key:'DHNBZ-2ZLKK-T7IJJ-AXSQW-WX5L6-A6FJZ'
});
const app = getApp()
Page({
    data: {
        currentTab: 1,
        currentCost: 0,
        cart: '快车',
        navScrollLeft: 0,
        duration: 1000,
        interval: 5000,
        isLoading: true,
        color:"#cccccc",
        callCart: true,
        destination: '',
        bluraddress : '',
        index: '',
        first: false
    },
    onLoad: function(options) {
      // console.log("index.js")
      if (!wx.getStorageSync('userInfo')){
        wx.redirectTo({
          url: '/pages/authorization/authorization',
        })
      }
      if (options.first){
        this.setData({
          first: options.first
        })
      }
    },
    // 点击用户
    showUser() {
      // console.log(app.globalData.driverInfo.driverPhoneNumber)
      // console.log(app.globalData.userInfo.captcha)
      // 如果全局未存手机号进入登录页
      if (app.globalData.driverInfo && app.globalData.driverInfo.driverPhoneNumber) {
        wx.navigateTo({
          url: "/pages/user/user",
        })
      } else {
        wx.navigateTo({
          url: "/pages/login/login",
        })
      }
    },
    onShow(){
      
      var that = this
        this.setData({
            address:app.globalData.bluraddress,
            destination:app.globalData.destination,
            currentTab:app.globalData.id,
        })
      // 上岗时实时传送位置
      setTimeout(function () {
        // console.log('show:', app.globalData.driverInfo)
        // console.log('index司机信息：', app.globalData.driverInfo.driverStatus)
        if (that.data.first){
          if (app.globalData.driverInfo.driverStatus == 1) {
            wx.getLocation({
              type: "gcj02",
              success: (res) => {
                // console.log("获取司机经纬度", res)
                app.globalData.driverInfo.driverLocation = res.longitude + ',' + res.latitude
                // let str = app.globalData.driverInfo.driverLocation
                // let arr = str.split(',')
                // let longitude = arr[0]
                // let latitude = arr[1]
                // if (res.longitude - longitude != 0 || res.latitude - latitude != 0){
                let param3 = {
                  driverId: app.globalData.driverInfo.driverId,
                  driverLocation: res.longitude + ',' + res.latitude,
                  driverStatus: 1
                }
                console.log("上传司机经纬度", param3)
                util.request({
                  url: `${app.globalData.baseUrl}/api/driver/updateApiDriverInfoByDriverId`,
                  method: "post",
                  data: param3
                }).then(res3 => {
                  // console.log('司机位置更新：',res3)
                })
                // }
              }
            })
            let t = 0
            this.socketTimer = setInterval(() => {
              t++;
              wx.getLocation({
                type: "gcj02",
                success: (res) => {
                  // console.log("获取司机经纬度", res)
                  let str = app.globalData.driverInfo.driverLocation
                  let arr = str.split(',')
                  let longitude = arr[0]
                  let latitude = arr[1]
                  if (res.longitude - longitude != 0 || res.latitude - latitude != 0) {
                    let param3 = {
                      driverId: app.globalData.driverInfo.driverId,
                      driverLocation: res.longitude + ',' + res.latitude,
                      driverStatus: 1
                    }
                    console.log("上传司机经纬度", param3)
                    util.request({
                      url: `${app.globalData.baseUrl}/api/driver/updateApiDriverInfoByDriverId`,
                      method: "post",
                      data: param3
                    }).then(res3 => {
                      // console.log('司机位置更新：',res3)
                    })
                  }
                }
              })
            }, 60000)
          }
        } 
      }, 2000)
    },
   
    // 点击出车
    startDrive(e){
      console.log('app.driverInfo:',app.globalData.driverInfo)
      if (app.globalData.driverInfo.driverStatus == 0){
        wx.showToast({
          title: '您未上岗',
          icon: 'none'
        })
      } else if (app.globalData.openid == ''){
        wx.showToast({
          title: '请稍后再操作',
          icon: 'none'
        })
      } else{
        wx.navigateTo({
          url: "/pages/wait/wait",
        })
      }

    },
    // 出车
    toWait(e){
      wx.reLaunch({
          url:  "/pages/wait/wait",
      }),
      wx.setTopBarText({
          text: '等待应答'
          })
    },
    
    switchNav(event){
     
        this.requestWaitingtime();
       const cart = event.currentTarget.dataset.name
        let text = this.data.navData;
        this.setData({
            cart,
            isLoading:true,
            waitingTimes: ''
        })
        var cur = event.currentTarget.dataset.current; 
        var singleNavWidth = this.data.windowWindth/6;
        
        this.setData({
            navScrollLeft: (cur - 1) * singleNavWidth,
            currentTab: cur,
        })      
    },
    switchCart(e){
        const id = e.currentTarget.dataset.index;
        this.setData({
          index:id,
          
        })
       
    },
    switchTab(event){
        var cur = event.detail.current;
        var singleNavWidth =55;
        this.setData({
            currentTab: cur,
            navScrollLeft: (cur - 1) * singleNavWidth
        });
    },
    onChange(e){
        const currentCost = e.target.dataset.index;
        this.setData({
            currentCost
        })
      
    }
})