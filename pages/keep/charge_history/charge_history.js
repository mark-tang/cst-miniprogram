import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    historyData: {},
    showEmpty: false,
    showPage: false,
    page: 0,  // page从0开始
    pageCount: null,
  },
  onLoad: function () {
    app.viewRecord();//活跃度统计
    this.queryData()
  },
  queryData() {
    wx.showLoading({ title: '加载中...' })
    var self = this;
    Api.authGet('/member/charge-history', {
      page: this.data.page,
      pageSize: 15
    }, function (res) {
      var cData = res.data.data;
      // for (let i in cData) {
      //   cData[i].createTimestamp = self.changeFun(cData[i].createTimestamp)
      // }
      self.setData({
        historyData: [...self.data.historyData, ...cData],
        pageCount: res.data.page.page_count,
      })
      if (res.data.data.length > 0) {
        self.setData({
          showEmpty: false,
          showPage: true,
        })
      } else {
        self.setData({
          showEmpty: true,
          showPage: true,
        })
      }
    })
  },
  onReachBottom() {
    let self = this;
    let page = this.data.page;
    let pageCount = this.data.pageCount;
    if (page + 1 < pageCount) {
      page++
      self.setData({
        page: page
      })
      self.queryData()
    }
  },
  changeFun(value) {
    let date = new Date(value * 1000);
    let y = 1900 + date.getYear();
    let m = "0" + (date.getMonth() + 1);
    let d = "0" + date.getDate();
    return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
  }
})