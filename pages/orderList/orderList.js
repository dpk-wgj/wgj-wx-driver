const utils = require('../../utils/util.js')
import util from '../../utils/index';
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
          item.startTime = utils.formatTime(new Date(item.startTime))
        }
        // console.log("orderList:", orderList)

        this.setData({
          // time: utils.formatTime(new Date()),
          orderList
          // starAddress: app.globalData.bluraddress,
          // eddAddress: app.globalData.destination,
        })
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