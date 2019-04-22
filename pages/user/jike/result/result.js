import Api from "../../../../utils/api.js"
var WxParse = require('../../../../utils/wxParse/wxParse.js');
import wxbarcode from '../../../../utils/qrCode/index.js';
var app = getApp()
Page({
  data: {
    showSwiper: false,
    showCode: false,
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    // this.queryData(options.id)
    wxbarcode.qrcode('qrcode', 'code', 420, 420);
  },
  swiperChange(e) {
    if (e.detail.current == 1) {
      this.setData({
        showSwiper: false
      })
    }
  },
  queryData(id) {
    var self = this;
    Api.authPost('/activity/jike/index', {
      id: id
    }, function (res, header) {
      console.log(res)
      let content = res.data.content;
      content = content.replace(/<span>/g, '');
      content = content.replace(/<\/span>/g, '');
      WxParse.wxParse('detail', 'html', content, self, 0);
      self.setData({
        data: res.data
      })
    })
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  showCode(e) {
    let code = e.currentTarget.dataset.code;
    console.log(code)
    wxbarcode.qrcode('qrcode', code, 420, 420);
    this.setData({
      showCode: true
    })
  },
  hideCode() {
    this.setData({
      showCode: false
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
  call(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  },
  onPullDownRefresh() {
    this.queryData()
  }
})
