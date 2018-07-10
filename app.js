import util from './utils/index';
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
            console.log("登录：", res1)
            this.globalData.openid = res1.openid
            let param = {
              driverWxId: this.globalData.openid,
              // driverName: 
            }
            util.request({
              url: 'http://localhost:8000/public/driver/login',
              method: "post",
              data: param
            }).then(res2 => {
              console.log("后台请求登录：", res2)
              util.request({
                url: "http://localhost:8000/api/getUserInfoById",
                method: "post",
                data: {
                  "userId": 4
                }
              }).then(res => {
                console.log(res)
              })

            })
 
          }
              
        })
        
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
  },
  globalData: {
    userInfo: null,
    bluraddress: '范家新村-公交站',
    destination: '',
    id: '快车',
    strLatitude: 0,
    strLongitude: 0,
    endLatitude: 0,
    endLongitude: 0,
    play: '18.7',
    openid: "",
    appid: 'wx5f7c16298c6dcf9f',//appid需自己提供，此处的appid我随机编写
    secret: 'a4c87556f8c6dbee2e72e1115c636ab2',//secret需自己提供，此处的secret我随机编写
  }
})