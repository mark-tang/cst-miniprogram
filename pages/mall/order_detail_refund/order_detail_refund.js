import Api from "../../../utils/api.js"

var app = getApp()

Page({
  data:{
    activeIndex:0,
    //orderTitle:['全部','待付款','待消费','退款单','待评价'],
    orderTitle:[
      { text: '全部', isLoad: false },
      { text: '待付款', isLoad: false },
      { text: '待消费', isLoad: false },
      { text: '退款单', isLoad: false },
      { text: '待评价', isLoad: false },
    ],
    adressInfo: { userName: '旺仔牛奶', provinceName: '广东省深圳市', cityName:'深圳市'},
    orderList: [
      {
        'id': '21145145',
        'title': '2017新款汽车座椅皮套居家旅行必备良品震撼上市',
        'imgUrl': 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg',
        'type': 1,
        'price': '240',
        'orginPrice': '320',
        'process': '34',
        'saledCount': 50,
      },
      {
        'id': '21145145',
        'title': '2017新款汽车座椅皮套居家旅行必备良品震撼上市旅行必备良品震撼上市旅行必备良品震撼上市旅行必备良品震撼上市',
        'imgUrl': 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
        'type': 2,
        'price': '250',
        'orginPrice': '320',
        'endTime': '1498561200',
        'saledCount': 24,
      }
    ],
    cancelRenson:[
      { text: '地址写错了', value: '0' },
      { text: '我想重新拍', value: '1' },
      { text: '我不想买了', value: '2' },
      { text: '我要考虑一下', value: '3' },
      { text: '其它原因', value: '4' },
    ],
    totalMoney:8154.00
  },
  onLoad (options){
    app.viewRecord();//活跃度统计
    wx.showLoading({ title: '加载中' })
    this.queryData(options.orderid)
  },
  queryData(){
    var self = this;
    Api.authPost('/mall/order/order-info', { orderid: orderid }, function (res) {
      self.setData(res.data)
      self.setData({ showPage: true })

    })
    
  },
  calcTime(nowDate, endDate){
    var self = this;
    var diffDate = parseInt(endDate - nowDate);
    var day = Math.floor(diffDate / 86400)
    var dayRemain = diffDate % 86400
    var hour = Math.floor(dayRemain / 3600)
    var hourRemain = diffDate % 3600
    var minute = Math.floor(hourRemain / 60)
    var minuteRemain = diffDate % 60
    var second = minuteRemain
    if ((diffDate / 86400) > 1) {
      self.setData({ showDay: true });
    }
    this.setData({
      day: day,
      hour: self.formatNumber(hour),
      minute: self.formatNumber(minute),
      second: self.formatNumber(second),
    })
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  switchTab(e){
    var index = e.currentTarget.dataset.index;
    var orderTitle = this.data.orderTitle;
    orderTitle[index].isLoad = true;
    this.setData({
      activeIndex: index,
      orderTitle: orderTitle
    })

    //
  },
  openLoc() {
    var self = this;
    var serviceInfo = this.data.serviceInfo;
    wx.openLocation({
      latitude: Number(serviceInfo.latitude),
      longitude: Number(serviceInfo.longitude),
      scale: 28,
      name: serviceInfo.fullName,
      address: serviceInfo.address
    })
  },
  callNum(e) {
    var num = e.currentTarget.dataset.num
    wx.makePhoneCall({
      phoneNumber: num,
    })
  },
  cancelOrder(e){
    console.log(e)
  },
  conformOrder(){
    wx.navigateTo({
      url: '../complete_order/complete_order',
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  }
})