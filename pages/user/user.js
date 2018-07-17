// pages/login/login.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nextBtnDisabled: true,
    nextBtnBc: '#bcbcbc',
    phone: ''
  },
  onLoad: function () {
    let userInfo = app.globalData.userInfo
    this.setData({
      userInfo: userInfo
    })

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
  // 清空手机号
  deletePhone: function () {
    console.log("a")
    this.setData({ phone: '' })
  },
  // 登录
  login: function () {
    app.globalData.userInfo = { phone: this.data.phone }
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  // function login(){
  //   return 
  // }

  // function getUserInfo() {
  //   return new Promise((resolve, reject) => wx.login({
  //     success: resolve,
  //     fail: reject
  //   })).then(res => new Promise((resolve, reject) =>
  //       wx.getUserInfo({
  //         success: resolve,
  //         fail: reject
  //       })
  //     ))
  //   }
  // 登录
  onGotUserInfo: function (e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
  },
  wxLogin: function () {
    wx.login({
      success: function (res) {
        console.log("登录状态码：", res)
        if (res.code) {
          //发起网络请求
          wx.getUserInfo({
            success: function (res) {
              console("!!!", res.userInfo)
            }
          })
          wx.request({
            url: 'https://test.com/onLogin',
            data: {
              code: res.code
            }
          })

        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }

    });
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },

  toTel: function(){
    wx.navigateTo({
      url: '/pages/tel/tel',
    })
  }

})