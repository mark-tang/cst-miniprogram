import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    date: 1503158400,
    showDay:false,
    showPage:false,
  },
  onLoad(option){
    app.viewRecord();//活跃度统计
    console.log(option)
    if(option.id == 'test'){
      wx.showToast({
        title: '欢迎进入测试分享页',
      })
    }
    wx.showLoading({
      title: '加载中...',
    })
    setInterval(this.calcTime,1000)
    this.setData({
      host: Api.config.host
    })
  },
  calcTime (){
    var self = this;
    var nowDate = parseInt(new Date().getTime() * 0.001);
    var endDate = this.data.date;
   
    if (endDate > nowDate) {
      var diffDate = parseInt(endDate - nowDate);
      var day = Math.floor(diffDate / 86400)
      var dayRemain = diffDate % 86400
      var hour = Math.floor(dayRemain / 3600)
      var hourRemain = diffDate % 3600
      var minute = Math.floor(hourRemain / 60)
      var minuteRemain = diffDate % 60
      var second = minuteRemain
      if ((diffDate / 86400) > 1) {
        self.setData({ showDay:true});
      }
      this.setData({
        day: day,
        hour: hour,
        minute: minute,
        second: second,
        showPage:true,
      })
      wx.hideLoading()
    } else {
      console.info('已经到截止日期')
      this.setData({
        showPage: true,
      })
    }                               
  },
  runBargain (){
    var self = this;
    self.bargainCtrl(101)
  },
  onShareAppMessage: function () {
    return {
      title: '快来帮我看，我要买车！！！！！！！！',
      path: '/pages/buy/lottery_bargain/lottery_bargain?id=test',
      success: function (res) {
        // 转发成功
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  bargainCtrl(money) {   
    money.currentTarget ? money='' : money
    
    var self = this;
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
    });
    if (this.data.showMask2) { // 隐藏
      animation.scale(.8).opacity(0).step();
      setTimeout(function () {
        animation.scale(0).step()
        self.setData({
          barginAnimaData: animation.export()
        })
      }.bind(self), 200)
    } else {                   // 显示
      animation.scale(1).opacity(1).step();
    }
    this.setData({
      barginAnimaData: animation.export(),
      showMask2: !this.data.showMask2,
      money: money,
    });
  },
  dialogCtrl(dialogCon, dialogTitle) {
    dialogCon ? dialogCon : dialogCon=''
    dialogTitle ? dialogTitle : dialogTitle = "力道虽好，技术欠佳"
    var self = this;
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
    });
    if (this.data.showMask) { // 隐藏
      animation.scale(.8).opacity(0).step();
      setTimeout(function () {
        animation.scale(0).step()
        self.setData({
          dialogAnimaData: animation.export()
        })
      }.bind(self), 200)
    } else {                   // 显示
      animation.scale(1).opacity(1).step();
    }
    this.setData({
      dialogAnimaData: animation.export(),
      showMask: !this.data.showMask,
      dialogCon: dialogCon,
      dialogTitle: dialogTitle,
    });
  }
})