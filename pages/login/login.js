// pages/login/login.js
import util from '../../utils/index';
const app = getApp()
var interval = null //倒计时函数
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nextBtnDisabled: true,
    nextBtnBc: '#bcbcbc',
    sendBtnDisabled: true, 
    // sendBtnDisabled: false,       
    // sendBtnBc: 'red',
    phone: '',
    code: '',
    title: '激活账号',
    btn: '激活',
    send: false,
    time: '',
    interval: ''
  },
  onLoad: function (options) {
    if (options.change) {
      this.setData({
        title: options.title,
        btn: options.btn,
        change: options.change
      })
    }
  },
  testPhone: function (s) {
    if (s != null && s) {
      var length = s.length
      if (length = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/.test(s)) {
        return true
      } else {
        return false
      }
    }
  },
  // 输入手机号事件
  phoneInput: function (e) {
    var _self = this
    _self.setData({ phone: e.detail.value })
    var isPhone = _self.testPhone(e.detail.value)
    if (isPhone) {
      _self.setData({
        sendBtnDisabled: false,
        // sendBtnBc: 'green',
      })
    } else {
      _self.setData({
        sendBtnDisabled: true,
        // sendBtnBc: 'red',
      })
    }
    // console.log(this.data.sendBtnDisabled)
    // console.log(this.data.sendBtnBc)
  },
  // 清空手机号
  deletePhone: function () {
    // console.log("a")
    this.setData({ phone: '' })
  },
  // 输入验证码事件
  codeInput: function (e) {
    var _self = this
    _self.setData({ code: e.detail.value })
    var isPhone = _self.testPhone(this.data.phone)
    if (isPhone && this.data.code.length == 4) {
      _self.setData({
        nextBtnDisabled: false,
        nextBtnBc: '#4a4c5b'
      })
    } else {
      _self.setData({
        nextBtnDisabled: true,
        nextBtnBc: '#bcbcbc'
      })
    }
  },
  // 清空验证码
  deleteCode: function () {
    // console.log("a")
    this.setData({ code: '' })
  },
  // 发送验证码
  send: function () {
    var that = this;
    if(this.data.change){
      let param = {
        phoneNumber: this.data.phone
      }
      console.log('发送验证码:', param)
      util.request({
        url: `${app.globalData.baseUrl}/api/driver/sendCodeForDriver`,
        method: "post",
        data: param
      }).then((res) => {
        console.log('发送验证码返回值：', res)
        if (res.status == 1) {
          that.setData({
            send: true,
            sendBtnDisabled: true,
            time: 59
          })
          var currentTime = that.data.time
          interval = setInterval(function () {
            currentTime--;
            that.setData({
              time: currentTime
            })
            if (currentTime <= 0) {
              clearInterval(interval)
              that.setData({
                time: '',
                send: false,
                sendBtnDisabled: false
              })
            }
          }, 1000)
        }
      })
    } else{
      let param = {
        phoneNumber: this.data.phone
      }
      console.log('发送验证码:', param)
      util.request({
        url: `${app.globalData.baseUrl}/public/sendCodeForDriver`,
        method: "post",
        data: param
      }).then((res) => {
        console.log('发送验证码返回值：', res)
        if (res.status == 1) {
          that.setData({
            send: true,
            sendBtnDisabled: true,
            time: 59
          })
          var currentTime = that.data.time
          interval = setInterval(function () {
            currentTime--;
            that.setData({
              time: currentTime
            })
            if (currentTime <= 0) {
              clearInterval(interval)
              that.setData({
                time: '',
                send: false,
                sendBtnDisabled: false
              })
            }
          }, 1000)
        }
      })
    }
    
  },
  // 激活
  login: function () {
    // console.log('this.data.phone:',this.data.phone)
    // app.globalData.driverInfo.driverPhoneNumber = this.data.phone
    // console.log('app:', app.globalData.driverInfo)

    if(this.data.change){
      let param = {
        randomNum: this.data.code
      }
      util.request({
        url: `${app.globalData.baseUrl}/api/driver/bindDriverPhoneNumber`,
        method: "post",
        data: param
      }).then((res) => {
        console.log('切换返回值：', res)
        if (res.status == 0) {
          wx.showToast({
            title: '验证码错误',
            icon: 'none'
          })
        } else if (res.result == 1) {
          wx.showToast({
            title: '切换成功',
            icon: 'none'
          })
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/index/index',
            })
          }, 2000)
        }
      })
    } else{
      let param = {
        randomNum: this.data.code,
        driverWxId: app.globalData.openid
      }
      console.log('激活：', param)
      util.request({
        url: `${app.globalData.baseUrl}/public/bindDriverPhoneNumber`,
        method: "post",
        data: param
      }).then((res) => {
        console.log('激活返回值：', res)
        if (res.status == 0) {
          wx.showToast({
            title: '验证码错误',
            icon: 'none'
          })
        } else if (res.result == 1) {
          wx.showToast({
            title: '激活成功',
            icon: 'none'
          })
          let p = {
            driverWxId: app.globalData.openid
          }
          util.request({
            url: `${app.globalData.baseUrl}/public/driver/login`,
            method: "post",
            data: p
          }).then(res2 => {
            console.log('再次登录：', res2)
            if (res2.status === 1) {
              app.globalData.driverInfo = res2.result.driverInfo
              console.log('app:', app.globalData.driverInfo)
              wx.getLocation({
                type: "gcj02",
                success: (res) => {
                  // console.log("获取司机经纬度", res)
                  let param3 = {
                    driverId: app.globalData.driverInfo.driverId,
                    driverLocation: res.longitude + ',' + res.latitude,
                    driverStatus: 1
                  }
                  // console.log("上传司机经纬度", param3)
                  util.request({
                    url: `${app.globalData.baseUrl}/api/driver/updateApiDriverInfoByDriverId`,
                    method: "post",
                    data: param3
                  }).then(res3 => {
                    console.log('司机位置更新：', res3)
                  })
                }
              })
              let t = 0
              this.socketTimer = setInterval(() => {
                t++;
                wx.getLocation({
                  type: "gcj02",
                  success: (res) => {
                    console.log("获取司机经纬度", res)
                    let param3 = {
                      driverId: app.globalData.driverInfo.driverId,
                      driverLocation: res.longitude + ',' + res.latitude,
                      driverStatus: 1
                    }
                    // console.log("上传司机经纬度", param3)
                    util.request({
                      url: `${app.globalData.baseUrl}/api/driver/updateApiDriverInfoByDriverId`,
                      method: "post",
                      data: param3
                    }).then(res3 => {
                      // console.log('司机位置更新：',res3)
                    })
                  }
                })
              }, 60000)
            }

          })
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/index/index',
            })
          }, 2000)
        } else if (res.result == null) {
          wx.showToast({
            title: '激活失败',
            icon: 'none'
          })
        }
      })
    }
    
    
  }

})