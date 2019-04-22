import Api from "../../../utils/api.js";
//获取应用实例
var app = getApp()
Page({
  data: {
    advisorList: [
      { headUrl: '../../../images/touxiang.png', name: '宋冉冉-销售顾问', phoneNum: '15012733777' },
      { headUrl: '../../../images/touxiang.png', name: '宋冉冉-销售顾问', phoneNum: '15012733777' },
    ],
    saleAdvisor: {},
    xubaoAdvisor: {},
    isShowSale: false,
    isShowXubao: false,
    showPage: false,
  },
  onLoad() {
    
    wx.showLoading({
      title: '加载中...',
    })  
  },
  onShow(){
    app.viewRecord();//活跃度统计
    this.queryData()
  },
  queryData(){
    var self = this;
    Api.authGet('/owner/my-advisor', {}, function (res) {
      console.log(res);
      var saleAdvisor = res.data.sale_advisor;
      var xubaoAdvisor = res.data.xubao_advisor;
      if (saleAdvisor) {
        self.setData({ isShowSale: true })
      }
      if (xubaoAdvisor) {
        self.setData({ isShowXubao: true })
      }
      self.setData({
        showPage: true,
        saleAdvisor: saleAdvisor,
        xubaoAdvisor: xubaoAdvisor,
      })
    })
  },
  onShareAppMessage: function () {
    return {
      title:'售后顾问',
      //path: '/pages/keep/advisor/advisor',
      path: '/pages/keep/index/index',
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