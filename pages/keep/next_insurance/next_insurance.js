var utils = require("../../../utils/util.js")
import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    showMask: false,
    showPopus: false,
    itemData: {
      preBaoxianTime: '--',
      nextBaoxianTime: '--',
      days: '--',
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
    Api.authPost('/baoxian/index', {}, function (res) {
      console.log(res)
      var res = res.data;
      if (res.nextBaoxianTime !== '--') {
       
        // } else if (itemData.days == 0) {
        //   itemData.days = '今天续保'
        // } else if (itemData.days < 0) {
        //   itemData.days = '已超过续保时间' + -itemData.days + '天'
        // }
        self.setData({
          showPage: true,
          // itemData: itemData,
          record: 1
        })
      } else {
        self.setData({
          showPage: true,
          record: 0,
          // itemData: {
          //   preBaoxianTime: '--',
          //   nextBaoxianTime: '--',
          //   days: '--',
          // }
        })
      }
      var itemData = res;
      itemData.days = itemData.days + '天'
      self.setData({
        showPage: true,
        itemData: itemData,
      })
      wx.hideLoading();
    })
  },
  addRecord(e) {
    wx.navigateTo({
      url: '../next_insurance_add/next_insurance_add?type=' + e.target.dataset.type,
    })
  },
  navigateTo: function (e) {
    utils.href(e);
  }

})
