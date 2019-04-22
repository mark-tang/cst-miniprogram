import Api from "../../../../utils/api.js";
var app = getApp()
Page({
  data: {
    isPaying:false,
  },
  onLoad: function (options) {
    this.setData({
      options: options
    })
  },
  onShow: function () {
    app.viewRecord();//活跃度统计
    this.queryData();
  },
  queryData(){
    let self = this;
    Api.authPost('/activity/jike/index', {
      id: self.data.options.id
    }, function (res, header) {
      let options = self.data.options
      options.payAmount = res.data.pay_amount
      self.setData({
        data: res.data,
        options: options
      })
    })
  },
  goPay() {
    let self = this;
    let pramas = {
      id: self.data.options.id,
      join_id: this.data.data.my_join_log.id,
      is_app: 1,
    }
    if(this.data.isPaying){
      return;
    }
    this.setData({
      isPaying: true
    })
    //return;
    Api.authPost('/activity/jike/pay', pramas, function (res) {
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
        let options = self.data.options;
        options.isFail = 'false'
        self.setData({
          options: options
        })
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1500
        })
        self.setData({
          isPaying: false
        })
      },
      'fail': function (res) {
        self.setData({
          isPaying: false
        })
        Api.Utils.toast('支付失败');
      }
    })
  }
})