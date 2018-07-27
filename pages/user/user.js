// pages/login/login.js
const app = getApp()
import util from '../../utils/index';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nextBtnDisabled: true,
    nextBtnBc: '#bcbcbc',
    phone: ''
  },
  onLoad: function (options) {
    let userInfo = app.globalData.driverInfo
    this.setData({
      userInfo: userInfo
    })
    // console.log(this.data.userInfo)
    var info = this.data.userInfo
    var str = this.data.userInfo.driverPhoneNumber
    var after = str.substr(0, parseInt(str.split('').length / 3)) + '****' + str.substr(parseInt(str.split('').length / 3 + 4), str.split('').length)
    // console.log(after)
    info.driverPhoneNumber = after
    this.setData({
      userInfo: info
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
    var title = "切换手机号"
    wx.navigateTo({
      url: '/pages/login/login?title=' + title + '&change=true',
    })
  },

  // 扫一扫
  scanCode: function () {
    var that = this
    // wx.scanCode({
    //   success: function (res) {
    //     that.setData({
    //       result: res.result
    //     })
    //   },
    //   fail: function (res) {
    //   }
    // })
    let driverStatus
    if (app.globalData.driverInfo.driverStatus == 0){
      driverStatus = 1
    } else if (app.globalData.driverInfo.driverStatus == 1) {
      driverStatus = 0
    }

    let param = {
      driverId: app.globalData.driverInfo.driverId,
      driverStatus: driverStatus
    }
    // console.log('param:', param)
    util.request({
      url: `${app.globalData.baseUrl}/api/driver/updateApiDriverInfoByDriverId`,
      method: "post",
      data: param
    }).then(res => {
      console.log('更换上下岗状态：', res)
      if(res.status == 1){
        if (app.globalData.driverInfo.driverStatus == 0){
          console.log('上岗')
          app.globalData.driverInfo.driverStatus = 1
          wx.showToast({
            title: '上岗成功',
            icon: 'none'
          })
        } else if (app.globalData.driverInfo.driverStatus == 1){
          console.log('下岗')
          app.globalData.driverInfo.driverStatus = 0
          wx.showToast({
            title: '已下岗',
            icon: 'none'
          })
        }    
      }
    })

  },

})