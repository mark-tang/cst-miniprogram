import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    showMask: false,
    showPopus: false,
    itemData: {
      shangPaiTime: '未设置',
      nianjianTime: '未设置',
      days: '未设置',
    },
    showPage: false,
  },
  onLoad() {
    app.viewRecord();//活跃度统计
    wx.showLoading({
      title: '加载中...',
    })
  },
  onShow() {
    this.queryData();
  },
  queryData() {
    var self = this;
    Api.authPost('/nianjian/index', { from: '2' }, function (res) {
      console.log(res)
      var res = res.data;
      if (res.shangPaiTime !== '--') {
        var itemData = res;

        // if (itemData.days > 0) {
        itemData.days = itemData.days + '天'
        // } else if (itemData.days == 0) {
        //   itemData.days = '今天年检'
        // } else if (itemData.days < 0) {
        //   itemData.days = '已超过年检时间' + -itemData.days + '天'
        // }
        var isSetting = true;
        if (parseInt(itemData.days) > 179) {
          isSetting = false
        }
        console.log(isSetting)
        self.setData({
          showPage: true,
          itemData: itemData,
          isSetting: isSetting
        })

      } else {
        self.setData({
          showPage: true,
          itemData: {
            shangPaiTime: '--',
            nianjianTime: '--',
            days: '--',
          }
        })
      }
      wx.hideLoading();
    })
  },
  addRecord() {
    let date = this.data.itemData.nianjianTime;
    let self = this;
    if (this.data.isSetting) {
      Api.authPost('/nianjian/set', {
        date: date,
        from: 2
      }, function (res) {
        if (res.code == 200) {
          self.queryData();
          wx.showToast({
            title: '更新成功',
            mask: true,
          })
        }
      })
    }
  }
})
