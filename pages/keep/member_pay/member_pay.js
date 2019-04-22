import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    payMethods: ['余额支付','微信支付'],
    payIndex:0,
    isPaying:false,
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
  },
  typePicker(e) {
    this.setData({
      payIndex: e.detail.value
    })
  },
  // 提交表单
  submitForm(e) {
    let self = this;
    let amount = e.detail.value.amount;
    let payMethod = this.data.payIndex == 0 ? 1:2;
    let remark = e.detail.value.remark;
    if (this.data.isPaying) {
      return
    }
    this.setData({
      isPaying:true
    })
    wx.showLoading({
      title: '加载中...',
    })
    Api.authPost('/member/payment', {
      payMethod: payMethod,
      amount: amount,
      type: 'payment',
      remark: remark,
      isApp: 1
    }, function (res) {
      wx.hideLoading();
      
      if (payMethod == 2){
        self.wechatPay(res.data);
      }else{
        self.setData({isPaying: false})
        if (res.data.data == 0) {
          Api.Utils.toast('消费异常，余额不足');
        }else{
          wx.showToast({
            title: res.data.msg,
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          },1500)
        }
      }
    })
  },
  // 微信支付
  wechatPay(data) {
    let self = this
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': data.signType,
      'paySign': data.paySign,
      'success': function (res) {
        self.setData({ isPaying: false })
        wx.showToast({
          title: '付款成功',
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      },
      'fail': function (res) {
        self.setData({ isPaying: false })
        Api.Utils.toast('付款失败');
      }
    })
  },
  onReachBottom: function () {
  
  }
})