const utils = require('../../utils/util.js')
import util from '../../utils/index';
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
qqmapsdk = new QQMapWX({
  key: 'DHNBZ-2ZLKK-T7IJJ-AXSQW-WX5L6-A6FJZ'
});
const app = getApp()
Page({
  data: {
    time: '',
    orderList: []
  },
  toRules(){
    wx.showToast({
      title: '暂未开放',
      icon: 'success',
      duration: 2000
    })
  },
  onLoad(){
    var that = this
    util.request({
      url: `${app.globalData.baseUrl}/api/driver/getOrderInfoByDriverId`,
      method: 'get'
    }).then(res=>{
      console.log("res:",res)
      if(res.status === 1){
        let orderList = res.result
        for(let item of orderList){
          // item.startLoc = "丽水学院东校区"
          // item.endLoc = "万地广场"
          item.startTime = this.startTimeFormat(item.startTime)
          if (item.orderStatus == 3) {     
            item.orderStatus = '已完成'
          } else if (item.orderStatus == 4) {
            item.orderStatus = '已取消'
          } else if (item.orderStatus == 2) {
            item.orderStatus = '已改派'
          } else {
            item.orderStatus = '未完成'
          }
          let startStr = item.startLocation
          let start = startStr.split(',')
          let endStr = item.endLocation
          let end = endStr.split(',')
          qqmapsdk.reverseGeocoder({
            location: {
              latitude: start[1],
              longitude: start[0]
            },
            success: function (addressRes) {
              item.startLoc = addressRes.result.formatted_addresses.recommend;
              // console.log('startLoc:',item.startLoc)
              // qqmapsdk.reverseGeocoder({
              //   location: {
              //     latitude: end[1],
              //     longitude: end[0]
              //   },
              //   success: function (addressRes) {
              //     item.endLoc = addressRes.result.formatted_addresses.recommend;
              //     console.log('endLoc:', item.endLoc)
              //     that.setData({
              //       orderList
              //     })
              //   },
              // })
            },
          })
          setTimeout(function(){
            qqmapsdk.reverseGeocoder({
              location: {
                latitude: end[1],
                longitude: end[0]
              },
              success: function (addressRes) {
                item.endLoc = addressRes.result.formatted_addresses.recommend;
                // console.log('endLoc:', item.endLoc)
                that.setData({
                  orderList
                })
              },
            })
          },1000)
        }
      }
    })
  },
  // 开始时间格式化
  startTimeFormat(e) {
    var time = e;
    var d = new Date(time);
    var times = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    return times;
  },
  // 结束时间格式化
  endTimeFormat(e) {
    var time = e;
    var d = new Date(time);
    var times = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    return times;
  },

  
})