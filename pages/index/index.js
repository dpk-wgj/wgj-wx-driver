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
    },
    onLoad: function(options) {
      // console.log("index.js")
      if (!wx.getStorageSync('userInfo')){
        wx.redirectTo({
          url: '/pages/authorization/authorization',
        })
      }
      this.requestCart();
      this.requestWaitingtime();
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
    getOrderList(e){
      wx.redirectTo({
        url: '/pages/orderList/orderList',
      })
    },
    requestCart(e){},
    onShow(){
      
        this.setData({
            address:app.globalData.bluraddress,
            destination:app.globalData.destination,
            currentTab:app.globalData.id,
        })
    },
    requestWaitingtime(){},
   
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
      } else if (app.globalData.driverInfo.driverPhoneNumber == null){
        wx.showToast({
          title: '未绑定手机号',
          icon: 'none',
          mask: true,
          success: function (e) {
            setTimeout(function () {
              wx.redirectTo({
                url: `/pages/login/login`,
              })
            }, 1000);
          }
        })
      } else{
        let params = {
          "driverId": app.globalData.driverInfo.driverId,
          "driverWxId": app.globalData.driverInfo.driverWxId,
          "driverStatus": 1
        }
        util.request({
          url: `${app.globalData.baseUrl}/api/driver/updateApiDriverInfoByDriverId`,
          data: params,
          method: 'post'
        }).then((res) => {
          console.log(res)
          if (res.status === 1) {
            wx.navigateTo({
              url: "/pages/wait/wait",
            })

          }

        })
      }
      
      // const destination =this.data.destination
      // if(destination==''){
      //   wx.showToast({
      //       title: '目的地不能为空',
      //       icon: 'fail',
      //      mask: true,
      //       duration: 1000
      //     })
      // }else{

      //   let {endLatitude,endLongitude} = app.globalData
      //   qqmapsdk.calculateDistance({
      //       mode: 'driving',
      //       to:[ {
      //         latitude: endLatitude,
      //         longitude:endLongitude
      //     }],
      //     success: (res)=> {
      //       // console.log(res.result.elements[0].distance)
      //       var num1 = 8+1.9*(res.result.elements[0].distance/1000)
      //       var num2= 12+1.8*(res.result.elements[0].distance/1000)
      //       var num3= 16+2.9*(res.result.elements[0].distance/1000)
      //       var play1 = num1.toFixed(1)
      //       var play2 = num2.toFixed(1)
      //       var play3 = num3.toFixed(1)
      //       this.setData({
      //           play1:play1,
      //           play2:play2,
      //           play3:play3,
      //       })
      //     },
         
      //     });
      //   this.setData({
        
      //       callCart: false
      //   })
      // }
        
       
    },
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