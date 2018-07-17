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
    console.log("哈哈哈哈哈")

    if (app.globalData.socketOpen) {
      wx.sendSocketMessage({
        data: msg
      })
    } else {
      app.globalData.socketMsgQueue.push(msg)
    }
  },
  onLoad: function (option) {
    //后台websocket传过来的乘客Id
    let passengerInfo = app.globalData.passengerInfo
    let orderInfo = app.globalData.currOrderInfo

    console.log("司机拿到的乘客信息和订单信息：", passengerInfo,orderInfo)
    this.setData({
      hiddenLoading:true,
      passengerInfo: passengerInfo,
      orderInfo: orderInfo
    })
    // socket接收
    wx.onSocketMessage(function (res) {
      res = JSON.parse(res.data)
      console.log('收到服务器内容：' + res.status)
      // res.status === 3  取消订单
      if (res.status === 3) {
        console.log("乘客已经取消了订单")
        wx.showToast({
          title: '乘客已经取消了订单',
          icon: 'fail',
          mask: true,
          duration: 1000
        })
        wx.redirectTo({
          url: '/pages/index/index',
        })
      }
    })
    // let { bluraddress,strLatitude,strLongitude,endLatitude,endLongitude} = app.globalData
    // this.setData({
    //   markers: [{
    //     iconPath: "../../assets/images/str.png",
    //     id: 0,
    //     latitude: strLatitude,
    //     longitude:strLongitude,
    //     width: 30,
    //     height: 30
    //   },{
    //     iconPath: "../../assets/images/end.png",
    //     id: 0,
    //     latitude: endLatitude,
    //     longitude:endLongitude,
    //     width: 30,
    //     height: 30
    //   }],
    //   polyline: [{
    //     points: [{
    //       longitude: strLongitude,
    //       latitude: strLatitude
    //     }, {
    //       longitude:endLongitude,
    //       latitude:endLatitude
    //     }],
    //     color:"red",
    //     width: 4,
    //     dottedLine: true
    //   }],
  
    // });
   
    wx.getSystemInfo({
      success: (res)=>{
        this.setData({
          controls:[{
            id: 1,
            iconPath: '../../assets/images/mapCart.png',
            position: {
              left: res.windowWidth/2 - 11,
              top: res.windowHeight/2 - 60,
              width: 22,
              height: 45
              },
            clickable: true
          },{
            id: 2,
            iconPath: '../../assets/images/location.png',
            position: {
              left: 20, // 单位px
              top: res.windowHeight -150, 
              width: 40, // 控件宽度/px
              height: 40,
              },
            clickable: true
          },{
            id: 3,
            iconPath: '../../assets/images/walk.png',
            position: {
              left: 20, // 单位px
              top: res.windowHeight -200, 
              width: 40, // 控件宽度/px
              height: 40,
              },
            clickable: true
          }],
      
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
  onShow(){
    // this.requesDriver();
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
  requesDriver(){
  },
  bindcontroltap: (e)=>{
    console.log("hello")
    this.movetoPosition();
  },
  changeDriver(e){
    let _this = this
    wx.showModal({
      content: '确定改派吗,这将会降低您的信用积分',
      cancelColor: '#cccccc',
      confirmColor: '#fc9c56',
      success: function (res) {
        if (res.confirm) {

          let params = { "orderId": app.globalData.currOrderInfo.orderId }
          util.request({
            url: `${app.globalData.baseUrl}/api/driver/updateOrderInfoByOrderId`,
            method: 'post',
            data: params
          }).then(res => {
            console.log("申请改派：", res)
            if (res.status === 1) {
              _this.sendSocketMessage('driver,changeDriver')
              wx.closeSocket({})        
              wx.redirectTo({
                url: "/pages/index/index"
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
    
      _this.sendSocketMessage('driver,arriveToPassenger')
      let params = {
        orderId: app.globalData.currOrderInfo.orderId,
        currentLocation: '1,1',
        targetLocation: '1,1'
      }
      util.request({
        url: `${app.globalData.baseUrl}/api/driver/accessToServiceForDriver`,
        method: 'post',
        data: params
      }).then(res => {
        console.log("接到乘客：", res)
        if (res.status === 1) {
          this.setData({
            bottomText: '到达目的地',
            isAccessPassenger: true
          })
          wx.showToast({
            title: '您已成功接到乘客',
            icon: 'success',
            duration: 3000
          })
        }
      })

    }else{//到达目的地

      _this.sendSocketMessage('driver,arriveToDest')

      wx.onSocketMessage(function (res) {
        res = JSON.parse(res.data)
        // res.status === 2  取消订单
        console.log('收到服务器内容：' + res.data)
      })

      let params = {
        orderId: app.globalData.currOrderInfo.orderId,
        currentLocation: '1,1',
        targetLocation: '1,1'
      }

      util.request({
        url: `${app.globalData.baseUrl}/api/driver/arrivedTargetLocation`,
        method: 'post',
        data: params
      }).then(res => {
        console.log("到达目的地：", res)
        if (res.status === 1) {
          wx.redirectTo({
            url: "/pages/orderEnd/orderEnd",
          })
        }
      })
    }
  },
  endOrder(){
    wx.closeSocket({
      success: function(res){
        console.log("关闭了socket",res)
      },
      complete: function (res) {
        console.log("关闭了socket", res)
      },
    })
    wx.redirectTo({
      url:"/pages/evaluation/evaluation",
    })  },
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
    wx.makePhoneCall({
      // phoneNumber: this.phone,
      phoneNumber: "12345678900",
      success: function () {
        console.log("拨打电话成功")
      },
      fail: function () {
        console.log("拨打电话失败")
      }
    })
  },
  toApp() {
    wx.showToast({
      title: '暂不支持',
      icon: 'success',
      duration: 1000
    })
  },

  
  
})