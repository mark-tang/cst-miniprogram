// pages/keep/member_service/member_service.js;
import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
  
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
    this.queryData();
  },
  queryData() {
    let self = this;
    Api.authPost('/member/instr', {}, function (res) {
      console.log(res)
      self.setData({
        inStr : res.data
      })
      wx.hideLoading();
    })
  }
})