import Api from "../../../utils/api.js"

var app = getApp()

Page({
  data:{
    activeIndex:0,
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
    var self = this;
    var type =  options.type || 0;
    this.setData({
      activeIndex:type
    })
    this.queryData()
    //获取商家信息
    app.getServiceInfo(function (serviceInfo) {
      self.setData({ serviceInfo: serviceInfo })
    })
  },
  queryData(){
    var self = this;
    
    setInterval(function(){
      var nowDate = new Date() * 0.001;
      self.calcTime(nowDate, 1501066800)
    },1000)
    
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
  cancelOrder(e){
    console.log(e)
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
  conformOrder(){
    wx.navigateTo({
      url: '../complete_order/complete_order',
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  }
})