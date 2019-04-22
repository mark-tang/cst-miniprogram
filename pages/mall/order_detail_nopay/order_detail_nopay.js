import Api from "../../../utils/api.js"

var app = getApp()
var nopayTimer
Page({
  data:{
    isDead:false,
    hasSend: false,
    cancelRenson:[
      { text: '地址写错了', value: '0' },
      { text: '我想重新拍', value: '1' },
      { text: '我不想买了', value: '2' },
      { text: '我要考虑一下', value: '3' },
      { text: '其它原因', value: '4' },
    ],
    totalMoney:0.00
  },
  onLoad (options){
    app.viewRecord();//活跃度统计
    var self = this;
    var orderid =  options.orderid;
    wx.showLoading({ title: '加载中...' })
    this.queryData(options.orderid)

    //获取商家信息
    app.getServiceInfo(function (serviceInfo) {
      self.setData({ serviceInfo: serviceInfo })
    })
  },
  queryData(orderid){
    var self = this;
    Api.authPost('/mall/order/order-info', { orderid: orderid},function(res){
      self.setData(res.data)
      var goodList = res.data.sub_goods
      var totalMoney = 0
      for (var i in goodList) {
        totalMoney = totalMoney + goodList[i].price * goodList[i].num
        if (goodList[i].is_express == 1) {
          self.setData({
            hasSend: true
          })
        }
      }
      self.setData({
        showPage: true,
        totalMoney: totalMoney
      })
      self.calcTime(Math.round(new Date().getTime() / 1000), res.data.ctime)

      nopayTimer = setInterval(function () {
        var nowDate = Math.round(new Date().getTime()/1000)
        self.calcTime(nowDate, res.data.ctime)
      }, 1000)
    }) 
  },
  openLoc() {
    var self = this;
    var serviceInfo = this.data.serviceInfo;
    wx.openLocation({
      latitude: Number(serviceInfo.latitude),
      longitude: Number(serviceInfo.longitude),
      scale: 28,
      name: serviceInfo.fullName,
      address: serviceInfo.address
    })
  },
  calcTime(nowDate, endDate){
    var self = this;
    var diffDate = parseInt(endDate - nowDate);
    var day = Math.floor(diffDate / 86400)
    var dayRemain = diffDate % 86400
    var hour = Math.floor(dayRemain / 3600)
    var hourRemain = diffDate % 3600
    var minute = Math.floor(hourRemain / 60)
    var minuteRemain = diffDate % 60
    var second = minuteRemain
    if ((diffDate / 3600) > 1) {
      self.setData({ showHour: true });
    }
    if (diffDate<=0){
      clearInterval(nopayTimer)
      self.setData({isDead:true})
    }
    
    this.setData({
      day: day,
      hour: self.formatNumber(hour),
      minute: self.formatNumber(minute),
      second: self.formatNumber(second),
    })
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  switchTab(e){
    var index = e.currentTarget.dataset.index;
    var orderTitle = this.data.orderTitle;
    orderTitle[index].isLoad = true;
    this.setData({
      activeIndex: index,
      orderTitle: orderTitle
    })
  },
  //取消订单
  cancelOrder(e){
    var orderid = e.currentTarget.dataset.orderid
    Api.authPost('/mall/order/cancel',{
      out_trade_no: orderid
    },function(res){
      if(res.code == 200){
        wx.showToast({
          title: '订单取消成功',
          mask: true,
          success: function(res) {
            wx.setStorage({
              key: 'isRefreshOrder',
              data: true,
            })
            setTimeout(function(){
              wx.navigateBack({
                delta: 1
              })
            },1500)
          },
        })
      }
      }, function (res) {
        Api.Utils.toast('取消订单失败，请联系客服')
      })
  },
  //支付订单
  confirmOrder(e) {
    var self = this
    var orderid = this.data.order_id;
    var fromId = e.detail.formId;
    Api.authPost('/mall/order/re-payment', {
      orderId: orderid,
      fromId: fromId
    }, function (res) {
      if (res.data.appId) {
        self.weChatPay(res.data, function () {
          wx.showToast({
            title: '支付成功！',
          })
          wx.setStorage({
            key: 'isRefreshOrder',
            data: true,
          })
          setTimeout(function(){
            wx.navigateBack({
              delta:1
            })
          },1500)
        })
      } else if (res.code == 200) {
        wx.showToast({
          title: '支付成功！',
        })
        wx.setStorage({
          key: 'isRefreshOrder',
          data: true,
        })
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    })
  },
  //微信支付
  weChatPay(JSInfo, cb) {
    var self = this
    wx.requestPayment({
      'timeStamp': JSInfo.timeStamp,
      'nonceStr': JSInfo.nonceStr,
      'package': JSInfo.package,
      'signType': JSInfo.signType,
      'paySign': JSInfo.paySign,
      'success': function (res) {
        Api.Utils.toast('支付成功!');
        cb()
      },
      'fail': function (res) {
        if (!res.err_desc) {
          //用户取消支付
          Api.Utils.toast('用户取消支付')
        } else {
          //支付失败
          wx.showModal({
            title: '支付失败',
            content: '失败原因\n' + res.err_desc,
            showCancel: false,
            success(res) {
              self.setData({ isPaying: false, payBtnText: '支付订单' })
            }
          })

        }

      }
    })
  },
  callNum(e) {
    var num = e.currentTarget.dataset.num
    wx.makePhoneCall({
      phoneNumber: num,
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  }
})