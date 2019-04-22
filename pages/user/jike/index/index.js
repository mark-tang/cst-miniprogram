import Api from "../../../../utils/api.js"
var WxParse = require('../../../../utils/wxParse/wxParse.js');
import wxbarcode from '../../../../utils/qrCode/index.js';
var app = getApp()
Page({
  data: {
    showPage: false,
    showSwiper:true,
    showCode: false,
    isFirst: false,
    isEnd:false,
    isPaying:false,
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    this.setData({
      activeID: options.id,
      sign: options.sign ? options.sign:false,
      isSign: options.isSign ? options.isSign: false,
      activeTitle: options.title,
    });
    wx.showLoading({
      title: '加载中...',
    })
    wx.setNavigationBarTitle({
      title: options.title || '活动报名',
    })
  },
  onShow() {
    this.queryData();
  },
  imageLoad(){
    wx.hideLoading();
  },
  swiperChange(e){
    if (e.detail.current == 1){
      this.setData({
        showSwiper:false
      })
    }
  },
  queryData() {
    var self = this;
    Api.authPost('/activity/jike/index', {
      id: self.data.activeID
    }, function (res, header) {
      console.log(res)
      let content = res.data.content;
      content = content.replace(/<span>/g, '');
      content = content.replace(/<\/span>/g, '');
      WxParse.wxParse('detail', 'html', content, self, 5);
      self.setData({
        data: res.data,
        showPage: true,
      })
      /*
      * 判断报名状态 [joinStatus]
      *   0 => 未报名
      *   1 => 已报名，待支付
      *   2 => 已报名，已完成支付
      */
      let joinStatus = null; 
      if (Object.keys(res.data.my_join_log).length > 0) { // 报名成功
        if (res.data.need_pay === 1) {
          res.data.my_join_log.pay_status === 0 ? joinStatus = 1 : null // 待支付
          res.data.my_join_log.pay_status === 1 ? joinStatus = 2 : null  // 已支付
        } else {
          joinStatus = 3 // 不需要支付
        }
      } else {
        joinStatus = 0 // 报名状态
      }
      self.setData({
        joinStatus: joinStatus,
      })
      
      let beginTime = res.data.server_timestamp;
      let jikeTimer = setInterval(() => {
        let diffTime = res.data.sign_end - beginTime;
        if (diffTime > 0){
          self.setData({
            day: Math.floor(diffTime / 86400),
            hour: self.formatNumber(Math.floor(diffTime % 86400 / 3600)),
            minute: self.formatNumber(Math.floor(diffTime % 3600 / 60)),
            second: self.formatNumber((diffTime % 60).toFixed(0)),
          })
          
        }else{
          clearInterval(jikeTimer)
          self.setData({
            isEnd:true
          })
        }
        beginTime++
      }, 1000)
    })
  },
  goPay() {
    let self = this;
    let pramas = {
      id:this.data.activeID,
      join_id: this.data.data.my_join_log.id,
      is_app:1,
    }

    this.setData({ isPaying: true});
    //return;
    Api.authPost('/activity/jike/pay', pramas, function (res) {
      self.setData({
        isFirst: false,
      })
      self.wechatPay(res.data)
    })
  },
  wechatPay(data) {
    let self = this;
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': data.signType,
      'paySign': data.paySign,
      'success': function (res) {
        setTimeout(res => {
          if (!self.data.sign) {
            if (self.data.isFirst) { // 报名并支付
              wx.navigateTo({
                url: `../payment/payment?isFail=false&id=${self.data.activeID}&payAmount=${self.data.data.pay_amount}`,
              })
            } else { // 去支付按钮过来的
              self.queryData()
            }
          } else {
            if (self.data.isSign) { // 报过名的签到
              self.queryData()
            } else {
              wx.navigateTo({
                url: `../sign/sign?id=${self.data.activeID}&tel=${self.data.data.my_join_log.phone}`,
              })
            }
          }
        }, 1500)
        self.setData({ isPaying: false });
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1500
        })
      },
      'fail': function (res) {
        Api.Utils.toast('支付失败');
        self.setData({ isPaying: false });
        if (!self.data.sign) {
          if (self.data.isFirst) {
            wx.navigateTo({
              url: `../payment/payment?isFail=true&id=${self.data.activeID}`,
            })
          } else {
            self.queryData()
          }
        } else {
          if (self.data.isSign) {
            self.queryData()
          } else {
            wx.navigateTo({
              url: `../sign/sign?id=${self.data.activeID}&tel=${self.data.data.my_join_log.phone}`,
            })
          }
        }
      }
    })
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  openLoc(e){
    wx.openLocation({
      latitude: Number(e.currentTarget.dataset.lat),
      longitude: Number(e.currentTarget.dataset.long),
      name: e.currentTarget.dataset.name,
      address: e.currentTarget.dataset.address,
      scale: 28
    })
  },
  call(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  navigateTo(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  onShareAppMessage() {
    let self = this;
    return {
      title: self.data.activeTitle || '活动报名',
      path: `/pages/user/jike/index/index?id=${self.data.activeID}&title=${self.data.activeTitle}&type=1`,
    }
  }
})
