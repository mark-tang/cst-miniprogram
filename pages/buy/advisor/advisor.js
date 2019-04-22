import Api from "../../../utils/api.js";
//获取应用实例
var app = getApp()
Page({
  data: {
    advisorList: [ ],
    saleAdvisor: {},
    xubaoAdvisor: {},
    isShowSale: false,
    isShowXubao: false,
    showPage: false,
  },
  onLoad(){
    wx.showLoading({
      title: '加载中...',
    })
  },
  onShow() {
    this.queryData();
    app.viewRecord();//活跃度统计

  },
  queryData(){
    var self = this;
    Api.authGet('/comment/index', {}, function (res) {
      if (res.data.sell_advisor) {
        self.setData({
          showPage: true,
          advisorList: res.data.sell_advisor
        })
      } else {
        self.setData({
          showEmpty: true,
        })
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '销售顾问',
      //path: '/pages/buy/advisor/advisor',
      path: '/pages/buy/index/index',
      success: function (res) {
        // 转发成功

      },
      fail: function (res) {

      }
    }
  },
  navigateTo: function (e) {
    Api.Utils.href(e);
  },
  //拨打电话
  callNum(e) {
    var num = e.currentTarget.dataset.num;
    wx.makePhoneCall({
      phoneNumber: num
    })
  }

})