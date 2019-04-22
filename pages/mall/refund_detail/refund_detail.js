import Api from "../../../utils/api.js"

var app = getApp()

Page({
  data: {
    orderList: [

    ],
    cancelRenson: [
      { text: '地址写错了', value: '0' },
      { text: '我想重新拍', value: '1' },
      { text: '我不想买了', value: '2' },
      { text: '我要考虑一下', value: '3' },
      { text: '其它原因', value: '4' },
    ],
    totalMoney: 8154.00
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    wx.showLoading({ title: '加载中' })
    this.queryData(options.orderid)
  },
  queryData(orderid) {
    var self = this;
    Api.authPost('/mall/order/order-info', { orderid: orderid }, function (res) {
      self.setData(res.data)
      self.setData({ showPage: true })

    })

  },
  cancelOrder(e) {
    console.log(e)
  },
  conformOrder() {
    wx.navigateTo({
      url: '../complete_order/complete_order',
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  }
})