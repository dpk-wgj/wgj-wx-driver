import util from './utils/index';
var QQMapWX = require('libs/qqmap-wx-jssdk.js');
var qqmapsdk;
qqmapsdk = new QQMapWX({
  key: 'DHNBZ-2ZLKK-T7IJJ-AXSQW-WX5L6-A6FJZ'
});
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.login({
      success: res => {
        var d = this.globalData;//这里存储了appid、secret、token串  
        var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + d.appid + '&secret=' + d.secret + '&js_code=' + res.code + '&grant_type=authorization_code';
        
        util.request({
          url: url
        }).then((res1) => {
          if(res1.openid){
            // console.log("登录：", res1)
            this.globalData.openid = res1.openid
            let param = {
              driverWxId: this.globalData.openid,//this.globalData.openid
            }
            util.request({
              url: `${this.globalData.baseUrl}/public/driver/login`,
              method: "post",
              data: param
            }).then(res2 => {
              if (res2.status === 1) {
                console.log('res2:',res2)
                this.globalData.driverInfo = res2.result.driverInfo
                console.log("后台请求登录：", this.globalData.driverInfo)
                // if (this.globalData.driverInfo.driverStatus == 1){
                  wx.getLocation({
                    type: "gcj02",
                    success: (res) => {
                      // console.log("获取司机经纬度", res)
                      let param3 = {
                        driverId: this.globalData.driverInfo.driverId,
                        driverLocation: res.longitude + ',' + res.latitude
                      }
                      // console.log("上传司机经纬度", param3)
                      util.request({
                        url: `${this.globalData.baseUrl}/api/driver/updateApiDriverInfoByDriverId`,
                        method: "post",
                        data: param3
                      }).then(res3 => {
                        // console.log('司机位置更新：',res3)
                      })
                    }
                  })
                  let t = 0
                  this.socketTimer = setInterval(() => {
                    t++;
                    wx.getLocation({
                      type: "gcj02",
                      success: (res) => {
                        // console.log("获取司机经纬度", res)
                        let param3 = {
                          driverId: this.globalData.driverInfo.driverId,
                          driverLocation: res.longitude + ',' + res.latitude
                        }
                        // console.log("上传司机经纬度", param3)
                        util.request({
                          url: `${this.globalData.baseUrl}/api/driver/updateApiDriverInfoByDriverId`,
                          method: "post",
                          data: param3
                        }).then(res3 => {
                          // console.log('司机位置更新：',res3)
                        })
                      }
                    })
                  }, 60000)
                // }
                
               
              }
            })
          }    
        })
      }
    })

    // 获取用户信息
  },
  globalData: {
    baseUrl: 'http://120.79.251.229:8000',
    baseWsUrl: 'ws://120.79.251.229:8000',
    // baseUrl: 'http://localhost:8000',
    // baseWsUrl: 'ws://localhost:8000',
    userInfo: null, 
    socketOpen: false,
    socketMsgQueue: [],
    bluraddress: '范家新村-公交站',
    destination: '',
    id: '快车',
    strLatitude: 0,
    strLongitude: 0,
    endLatitude: 0,
    endLongitude: 0,
    play: '18.7',
    openid: "",
    appid: 'wx8884af693e78552c',//appid需自己提供，此处的appid我随机编写
    secret: '3df93d09a28a4d5fa9199088c89811f8',//secret需自己提供，此处的secret我随机编写
  }
})