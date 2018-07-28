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
    title: '绑定手机号',
    send: false,
    time: '',
    interval: ''
  },
  onLoad: function (options) {
    if (options.change) {
      this.setData({
        title: options.title
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
    let param = {
      phoneNumber: this.data.phone
    }
    console.log('发送验证码:',param)
    util.request({
      url: `${app.globalData.baseUrl}/public/sendCodeForDriver`,
      method: "post",
      data: param
    }).then((res) => {
      console.log('发送验证码返回值：',res)
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
  },
  // 登录
  login: function () {
    // console.log('this.data.phone:',this.data.phone)
    // app.globalData.driverInfo.driverPhoneNumber = this.data.phone
    // console.log('app:', app.globalData.driverInfo)
    let param = {
      randomNum: this.data.code,
      driverWxId: app.globalData.openid
    }
    console.log('激活：',param)
    util.request({
      url: `${app.globalData.baseUrl}/public/bindDriverPhoneNumber`,
      method: "post",
      data: param
    }).then((res) => {
      console.log('激活返回值：',res)
      if(res.result == 1){
        wx.navigateTo({
          url: '/pages/index/index',
        })
      }
      if(res.result == null){
        wx.showToast({
          title: '激活失败',
          icon: 'none'
        })
      }
    })
    
  }

})