var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
qqmapsdk = new QQMapWX({
  key:'DHNBZ-2ZLKK-T7IJJ-AXSQW-WX5L6-A6FJZ'
});
import util from '../../utils/index';

const app = getApp();
Page({
  data: {
    scale: 14,
    hiddenLoading:false,
    bottomText: '到达上车地点',
    isAccessPassenger: false,
    socktBtnTitle: '连接socket'
  },

  /**
   * 使用websocket连接
   */
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  sendSocketMessage: function (msg) {
    // console.log("哈哈哈哈哈")

    if (app.globalData.socketOpen) {
      wx.sendSocketMessage({
        data: msg
      })
    } else {
      app.globalData.socketMsgQueue.push(msg)
    }
  },
  onLoad: function (option) {
    var that = this
    //后台websocket传过来的乘客Id
    let passengerInfo = app.globalData.passengerInfo
    let orderInfo = app.globalData.currOrderInfo
    console.log('订单信息目的地：', app.globalData.currOrderInfo.endLocation)
    var str = orderInfo.endLocation
    var arr = str.split(',')
    console.assert('arr:',arr)
    orderInfo.endLocation1 = arr[0]
    // orderInfo.endLocation = endLocation;
    console.log("司机拿到的乘客信息和订单信息：", passengerInfo, orderInfo)
    that.setData({
      hiddenLoading: true,
      passengerInfo: passengerInfo,
      orderInfo: orderInfo
    })
    console.log('Service orderInfo:', this.data.orderInfo)
    // socket接收
    wx.onSocketMessage(function (res) {
      res = JSON.parse(res.data)
      console.log('收到服务器内容：+' + res.status)
      // res.status === 3  取消订单
      if (res.status === 4) {
        console.log("乘客已经取消了订单")
        wx.closeSocket()
        wx.showToast({
          title: '乘客已经取消了订单',
          icon: 'none',
          mask: true,
          duration: 2000,
          success: function(e){
            setTimeout(function(){
              wx.redirectTo({
                url: '/pages/index/index',
              })
            },2000)
            
            
          }
        })
        
      }
    })
      
   
  },
  navigate(e){
    wx.openLocation({
      latitude: 23.362490,
      longitude: 116.715790,
      scale: 18,
      name: '华乾大厦',
      address: '金平区长平路93号'
    })
  },
  // 页面显示
  onShow(){
    // console.log('onshow!!!')
    // if (app.globalData.currOrderInfo.flag){
      wx.getLocation({
        type: "gcj02",
        success: (res) => {
          console.log("获取服务中司机经纬度", res)
          app.globalData.currOrderInfo.locationInfo = res.longitude + ',' + res.latitude
          console.log('locationInfo:', app.globalData.currOrderInfo.locationInfo)
        }
      })
      let t = 0
      this.socketTimer = setInterval(() => {
        t++;
        wx.getLocation({
          type: "gcj02",
          success: (res) => {
            console.log("获取服务中司机经纬度", res)
            app.globalData.currOrderInfo.locationInfo += '-' + res.longitude + ',' + res.latitude
            console.log('locationInfo:', app.globalData.currOrderInfo.locationInfo)
          }
        })
      }, 1000)
    // }
   
    this.requesDriver();
    setTimeout(() => {
      this.setData({
        hiddenLoading: true,
      })
    },1500)
    this.setData({
      hiddenLoading: true,
    })
    this.mapCtx = wx.createMapContext("didiMap");
    this.movetoPosition();
  },
  onUnload(){
    // console.log(55555);
    clearInterval(this.socketTimer);

  },

  // 实时上传服务中司机位置 
  requesDriver(){
    
  },

  bindcontroltap: (e)=>{
    console.log("hello")
    this.movetoPosition();
  },

  // 申请改派
  changeDriver(e){
    let _this = this
    wx.showModal({
      content: '确定改派吗,这将会降低您的信用积分',
      cancelColor: '#cccccc',
      confirmColor: '#fc9c56',
      success: function (res) {
        if (res.confirm) {

          _this.sendSocketMessage('driver,changeDriver')
          wx.onSocketMessage(function (res) {

            res = JSON.parse(res.data)
            console.log('收到服务器内容：' + res.status)
            if(res.status === 3){
                  
              let params = { "orderId": app.globalData.currOrderInfo.orderId }
              util.request({
                url: `${app.globalData.baseUrl}/api/driver/updateOrderInfoByOrderId`,
                method: 'post',
                data: params
              }).then(res => {
                console.log("申请改派：", res)
                if (res.status === 1) {
                  wx.closeSocket({})        
                  wx.redirectTo({
                    url: "/pages/index/index"
                  })
                }
              })
            }

          })
        }
      }
    })  

  },
  changeState(e){
    let _this = this
    let userId = app.globalData.driverInfo.driverId
    if (!this.data.isAccessPassenger) {//到乘客上车点（接到乘客）
      console.log('乘客上车：',app.globalData.currOrderInfo)
      
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          let currentLocation = ''
          // console.log('getLocation res:',res)
          var latitude = res.latitude
          var longitude = res.longitude
          currentLocation = longitude + ',' + latitude
          // console.log('currentLocation:', currentLocation)
          console.log('app:', app.globalData.currOrderInfo)
          var str = app.globalData.currOrderInfo.startLocation
          var arr = str.split(',')
          let targetLocation = arr[1] + ',' + arr[2]
          _this.sendSocketMessage('driver,arriveToPassenger')
          let params = {
            orderId: app.globalData.currOrderInfo.orderId,
            currentLocation: currentLocation,
            targetLocation: targetLocation
          }
          console.log('params:', params)
          util.request({
            url: `${app.globalData.baseUrl}/api/driver/accessToServiceForDriver`,
            method: 'post',
            data: params
          }).then(res => {
            console.log("接到乘客：", res)
            if (res.status === 1) {
              _this.sendSocketMessage('driver,arriveToPassenger')
              _this.setData({
                bottomText: '到达目的地',
                isAccessPassenger: true
              })
              wx.showToast({
                title: '您已成功接到乘客',
                icon: 'success',
                duration: 3000
              })
            } else if (res.status === 0){
              wx.showToast({
                title: '未到指定地点',
                icon: 'none'
              })
            }
          })
        }
      })
      

    }else{//到达目的地

     
      let passengerInfo = app.globalData.passengerInfo
      let orderInfo = app.globalData.currOrderInfo
      // console.log('乘客信息:', passengerInfo)
      // console.log('订单信息：', orderInfo)
      // console.log('目的地：', orderInfo.endLocation)
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
          let currentLocation = ''
          // console.log('getLocation res:',res)
          var latitude = res.latitude
          var longitude = res.longitude
          currentLocation = longitude + ',' + latitude
          // console.log('currentLocation:', currentLocation)
          console.log('app:', app.globalData.currOrderInfo)
          var str = app.globalData.currOrderInfo.endLocation
          var arr = str.split(',')
          let targetLocation = arr[1] + ',' + arr[2]
          
          let params = {
            orderId: app.globalData.currOrderInfo.orderId,
            currentLocation: currentLocation,
            targetLocation: targetLocation,
            locationInfo: app.globalData.currOrderInfo.locationInfo
          }
          console.log('params:',params)
          util.request({
            url: `${app.globalData.baseUrl}/api/driver/arrivedTargetLocation`,
            method: 'post',
            data: params
          }).then(res => {
            console.log("到达目的地：", res)
            if (res.status === 1) {
              wx.onSocketMessage(function (res) {
                res = JSON.parse(res.data)
                // res.status === 2  取消订单
                // console.log('收到服务器内容（到达目的地）：' + res.data)
              })
              _this.sendSocketMessage('driver,arriveToDest')

              wx.closeSocket()
              wx.redirectTo({
                url: "/pages/orderEnd/orderEnd",
              })             
              let p = {
                orderId: app.globalData.currOrderInfo.orderId
              }
              util.request({
                url: `${app.globalData.baseUrl}/api/driver/getOrderByOrderId`,
                method: 'post',
                data: p
              }).then(res => {
                console.log('到达目的地改变订单信息', res)
                app.globalData.currOrderInfo = res.result.order.orderInfo
                console.log('到达目的地后res.orderinfo：', res.result.order.orderInfo)
                console.log('到达目的地后app.orderinfo：', app.globalData.currOrderInfo)
              })
            } else if (res.status === 0){
              wx.showToast({
                title: '未到达目的地',
                icon: 'none'
              })
            }
          })
        }
      })
      

      
    }
  },
  // 结束行程
  endOrder(){
    wx.closeSocket({
      success: function(res){
        console.log("关闭了socket",res)
      },
      complete: function (res) {
        console.log("关闭了socket", res)
      },
    })
    // wx.redirectTo({
    //   url:"/pages/evaluation/evaluation",
    // })  
    },
  onReady: function () {
    wx.getLocation({
      type: "gcj02",
      success:(res)=>{
        this.setData({
          longitude:res.longitude,
          latitude: res.latitude
        })
      }
    })
     
  },
  movetoPosition: function () {
    this.mapCtx.moveToLocation();
  },

  bindregionchange: (e) => {

  },
  toCancel() {
    wx.redirectTo({
      url: "/pages/cancel/cancel"
    })
  },
  // 拨打电话
  calling: function () {
    console.log('手机号:', app.globalData.passengerInfo.passengerPhoneNumber)
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
  },

  
  
})