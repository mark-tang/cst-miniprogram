import Api from "../../../utils/api.js";
var utils = require('../../../utils/util.js');
var nowPage = 1;
var pageCount = 1;
var app = getApp()

Page({
  data: {
    showPage: false,
    exchangeMoney:'0.00'
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
    this.setData({
      isSubmit: false,
      integral: options.integral,
      exchange_value: options.exchange_value,
    })
    // this.queryLeave();
    // this.queryRecord();
  },
  queryLeave() {
    let self = this;
    let coin = this.data.coin;
    let growth = this.data.growth;
    Api.authPost('/member/level-enum', {}, function (res) {
      let levelData = res.data.enum;
      let nextInteger = res.data.integralConfig.integral_exchange_value;
      let LevelIndex = 0;
      let tips = res.data.integralConfig.how;
      for (let i in levelData) {
        if (growth >= levelData[i].range_min && growth < levelData[i].range_max) {
          LevelIndex = Number(i)
        }
      }
      self.setData({
        levelData: levelData,
        tips: tips,
        nextInteger: nextInteger,
        LevelIndex: LevelIndex,
        addIndex: LevelIndex + 1,
        showPage: true
      })
      wx.hideLoading();
    })
  },
  submitForm(e) {
    let money = e.detail.value.money;
    console.log(money)
    console.log(this.data.exchange_value)
    let self = this;
    if(money <= 0) {
      Api.Utils.toast('兑换积分不能为空！')
    } else if (Number(money) < this.data.exchange_value) {
      Api.Utils.toast('兑换积分不能少于' + this.data.exchange_value)
    } else if (money > this.data.integral) {
      Api.Utils.toast('兑换积分大于可兑换积分！')
    } else {
      self.setData({isSubmit:true})
      Api.authPost('/member/integral-exchange', {
        integral: money
      }, function (res) {
        if (res.data.error == 0) {
          Api.Utils.toast('兑换成功！');
          setTimeout(() => {
            self.setData({ isSubmit: false })
            wx.navigateBack({
              delta: 2
            })
          }, 1500)
        }else{
          Api.Utils.toast(res.data.msg)
        }
      }, function (res) {
        Api.Utils.toast(res.msg)
      })
    }
  },
  inputMoney(e) {
    let money = e.detail.value;
    let exchangeMoney = money ? (money / this.data.exchange_value).toFixed(2): '0.00' ;
    this.setData({
      exchangeMoney: exchangeMoney
    })
  }
})