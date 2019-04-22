import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    showPage:false,
    inputValue: null,
    offerList: [],
    selectIndex: -1,
    selectMoney: null,
    placeholderText: '充值金额',
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
    this.queryData()
  },
  // 微信支付
  wechatPay(data) {
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': data.signType,
      'paySign': data.paySign,
      'success': function (res) {
        wx.showToast({
          title:'充值成功',
          icon:'success',
          duration:1500
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      },
      'fail': function (res) {
        Api.Utils.toast('充值失败');
      }
    })
  },
  // 提交表单
  submitForm(e) {
    var self = this;
    var amount;
    if (this.data.selectMoney && this.data.selectIndex != -1){
      amount = this.data.selectMoney;
    }else{
      amount = e.detail.value.amount;
    }
    console.log(amount)
    if (!amount){
      Api.Utils.toast('充值金额不能为空');
      return;
    }
    Api.authPost('/member/payment', {
      payMethod:2,
      amount: amount,
      type:'charge',
      isApp:1
    }, function (res) {
      console.log(res)
      self.wechatPay(res.data)
      wx.hideLoading();
    })
  },
  // 获取会员充值金额列表
  queryData() {
    wx.showLoading({ title: '加载中...' })
    var self = this;
    Api.authGet('/member/money-list', {}, function (res) {
      self.setData({
        offerList: res.data,
      })
      if (res.data.length > 0) {
        self.setData({
          placeholderText: '其他金额',
          showPage: true,
        })
      } else {
        self.setData({
          showPage: true,
        })
      }
    })
  },
  // 充值优惠选择
  selectView(event) {
    //更新数据
    this.setData({
      selectIndex: event.currentTarget.id,
      selectMoney: this.data.offerList[event.currentTarget.id].numbers,
      inputValue: null
    })
  },
  // 输入框获取焦点时触发
  inputFocus(event) {
    this.setData({
      selectMoney: null,
      selectIndex: -1
    })
  },
  navigateTo: function (e) {
    Api.Utils.href(e)
  }
})