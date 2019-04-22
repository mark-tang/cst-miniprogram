import Api from "../../../../utils/api.js"
var WxParse = require('../../../../utils/wxParse/wxParse.js');
var app = getApp()
Page({
  data: {
  
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
    this.queryData()
  },
  queryData(){
    let self = this;
    Api.authPost('/common/contact', {}, function (res, header) {
      let content = res.data.introduction;
      WxParse.wxParse('detail', 'html', content, self, 0);
      let contact = [
        res.data.salesServicePhone,
        res.data.afterSalesServicePhone,
        res.data.customerServicePhone,
        res.data.assistancePhone
      ]
      self.setData({
        data: res.data,
        contact: contact
      })
    })
  },
  openLoc(e) {
    wx.openLocation({
      latitude: Number(e.currentTarget.dataset.lat),
      longitude: Number(e.currentTarget.dataset.long),
      name: e.currentTarget.dataset.name,
      address: e.currentTarget.dataset.address,
      scale: 28
    })
  },
  showCall(e) {
    let self = this;
    let contact = this.data.contact;
    wx.showActionSheet({
      itemList: ['销售电话' + contact[0], '售后电话' + contact[1], '客服电话' + contact[2], '救援电话' + contact[3]],
      success: function (res) {
        self.call(res.tapIndex)
      }
    })
  },
  call(index) {
    wx.makePhoneCall({
      phoneNumber: this.data.contact[index]
    })
  },

  
})