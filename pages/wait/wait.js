var util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
  progress_txt: '已等待', 
  count:0, 
  waitTimer: null,
  time: '00:00',
  },
parseTime: function(time){
  var time = time.toString();
    return time[1]?time:'0'+time;
},

onLoad: function(){

  let _this = this

    /**
     * 连接websocket
     */
  let userId = app.globalData.driverInfo.driverId
    wx.connectSocket({
      url: `${app.globalData.baseWsUrl}/ws/driver/${userId}/0`
    })
    console.log(app.globalData.socketOpen)
    if (!app.globalData.socketOpen){
      wx.onSocketError(function (res) {
        app
        app.globalData.socketOpen = false
        console.log('WebSocket连接打开失败，请检查！')
      })
      wx.onSocketOpen(function (res) {
        console.log('WebSocket连接已打开！')
        _this.sendSocketMessage('driver,toWait')
        app.globalData.socketOpen = true
        for (var i = 0; i < app.globalData.socketMsgQueue.length; i++) {
          _this.sendSocketMessage(app.globalData.socketMsgQueue[i])
        }
        app.globalData.socketMsgQueue = []
      })
    }
    

    wx.onSocketMessage(function (res) {
      
      console.log('收到服务器内容：', res)
      res = JSON.parse(res.data)
    
      if (res.status === 1){
        app.globalData.passengerInfo = res.result.passenger
        console.log('wait:', res.result.passenger)
        app.globalData.currOrderInfo = res.result.order
        // wx.closeSocket()
        wx.redirectTo({
          url: `/pages/orderService/orderService`,
        })
      }
    })
    wx.onSocketClose(function (res) {
      app.globalData.socketOpen = false
      console.log('WebSocket 已关闭！')
    })
},

sendSocketMessage: function (msg) {
  if (app.globalData.socketOpen) {
    wx.sendSocketMessage({
      data: msg
    })
  } else {
    app.globalData.socketMsgQueue.push(msg)
  }
},
onUnload: function(){
  clearInterval(this.countTimer)
},
countInterval: function () {
   var curr = 0;
    var timer = new Date(0,0);
    var  randomTime = Math.floor(1000*Math.random()) ;
  this.countTimer = setInterval(() => {
    if (this.data.count <= randomTime) {
      this.setData({
              time: this.parseTime(timer.getMinutes())+":"+this.parseTime(timer.getSeconds()),
          });
          timer.setMinutes(curr/60);
                timer.setSeconds(curr%60);
                curr++;
       this.drawProgress(this.data.count / (60/2))
      this.data.count++;
    } else {
      this.setData({
        progress_txt: "匹配成功"
      }); 
      wx.redirectTo({
          url:  "/pages/orderService/orderService",
        });
      clearInterval(this.countTimer);
    }
  }, 1000)
},
drawProgressbg: function(){
   var ctx = wx.createCanvasContext('canvasProgressbg');
   ctx.setLineWidth(4);
   ctx.setStrokeStyle("#e5e5e5");
   ctx.setLineCap("round");
   ctx.beginPath();
   ctx.arc(110,110,100,0,2*Math.PI,false);
   ctx.stroke();
   ctx.draw();
  },
  onShow: function() {
    this.setData({
      address: app.globalData.bluraddress,
    })
  },
  onReady: function () {
    this.drawProgressbg();
    this.countInterval();
    this.drawProgress();
  },
  
  drawProgress: function (step){ 
    var context = wx.createCanvasContext('canvasProgress'); 
    context.setLineWidth(4);
    context.setStrokeStyle("#fbcb02");
    context.setLineCap('round')
    context.beginPath();
      // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(110, 110, 100, -Math.PI /2, step*Math.PI /2-Math.PI /2, false);
    context.stroke();
    context.draw()
  },
  // 取消 
  toCancel(){
    wx.showModal({
      content: '确定退出等待返回首页吗',
      cancelColor: '#cccccc',
      confirmColor: '#fc9c56',
      success: function (res) {
        if (res.confirm) {
          wx.redirectTo({
            url: "/pages/index/index",
          })
        }
      }
    })
  },
  backIndex(){
    wx.redirectTo({
      url:  "/pages/index/index",
    })
  }
 

})