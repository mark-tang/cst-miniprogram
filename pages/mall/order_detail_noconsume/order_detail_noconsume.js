import Api from "../../../utils/api.js"
var wxbarcode = require('../../../utils/qrCode/index.js');

var app = getApp()

Page({
  data: {
    showCode: false,
    activeIndex: 0,
    hasSend: false,
    isImgLoad:false,
    adressInfo: { userName: '旺仔牛奶', provinceName: '广东省深圳市', cityName: '深圳市' },
    fixed:false,
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
      }
    ]
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    var self = this
    wx.showLoading({ title: '加载中' })

    this.setData({
      orderid: options.orderid
    })
    //获取商家信息
    app.getServiceInfo(function (serviceInfo) {
      self.setData({ serviceInfo: serviceInfo })
    })
  },
  onShow() {
    var orderid = this.data.orderid
    this.queryData(orderid)
  },
  queryData(orderid) {
    var self = this;
    Api.authPost('/mall/order/order-info', { orderid: orderid }, function (res) {
      self.setData(res.data)
      self.setData({ showPage: true })
      var goodList = res.data.sub_goods
      var totalMoney = 0
      for (var i in goodList) {
        totalMoney = totalMoney + goodList[i].price * goodList[i].num
        if (goodList[i].is_express == 1) {
          self.setData({
            hasSend: true
          })
        }
      }

      self.setData({
        totalMoney: totalMoney
      })
    })
  },
  showCode(e) {
    var self = this
    var code = e.currentTarget.dataset.code
    var showCode = this.data.showCode;
    var fixed = this.data.fixed;
    this.setData({
      showCode: !showCode,
      fixed: !fixed,
      enCode: code,
      //isImgLoad: false,
    })
    showCode ? self.queryData(self.data.orderid) : wxbarcode.qrcode('qrcode', code, 400, 400)
  },
  imgLoad(){
    this.setData({
      isImgLoad:true,
    })
  },
  callNum(e) {
    var num = e.currentTarget.dataset.num
    wx.makePhoneCall({
      phoneNumber: num,
    })
  },
  confirmReceipt(e) {
    var self = this
    var orderid = e.currentTarget.dataset.orderid
    var thisOrderid = this.data.orderid
    console.log(orderid)
    wx.showModal({
      title: '',
      content: '是否确认收货',
      success: function (res) {
        if (res.confirm) {
          Api.authPost('/mall/order/confirm-receipt', { orderid: orderid }, function (respose) {
            if (respose.code == 200) {
              wx.showToast({
                title: '已确认收货',
              })
              wx.setStorage({
                key: 'isRefreshOrder',
                data: true,
              })
              self.queryData(thisOrderid)
            }
          })
        }
      }
    })

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
  navigateTo(e) {
    Api.Utils.href(e);
  }
})