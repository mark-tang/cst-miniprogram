import Api from '../../../utils/api.js'

//index.js
//获取应用实例
var app = getApp()
var timer
Page({
  data: {

  },
  onLoad(options){
    wx.showLoading({ title: '加载中...' })
    var self = this
    self.setData({
      id: options.id,
      gid: options.gid,
      fatherid: options.fatherid,
    })
    self.queryData()
  },
  onShow(){
    app.viewRecord();//活跃度统计
    this.queryData()
  },
  queryData(){
    var self = this
    var parma = {}
    if (self.data.id) {
      parma = { id: self.data.id }
    } else if (self.data.gid){
      parma = { gid: self.data.gid }
    } else {
      parma = { fatherid: self.data.fatherid }
    }
    Api.authPost('/mall/pro/fight-groups', parma, function (res) {
      wx.stopPullDownRefresh()
      self.setData(res.data)
      self.setData({ showPage: true})
      if (res.data.info.status == 0) {
        var endTime = parseInt(self.data.info.addTime) + 86400;
        var nowDate = Math.round(new Date().getTime() / 1000);
        self.calcTime(nowDate, endTime)
        timer = setInterval(function () {
          var endTime = parseInt(self.data.info.addTime) + 86400;
          var nowDate = Math.round(new Date().getTime() / 1000);
          self.calcTime(nowDate, endTime)
        }, 1000)
      }
    })
  },
  onHide (){
    clearInterval(timer)
  },
  joinTuan(e){
    var self = this
    var goodsid = e.currentTarget.dataset.goodsid;
    var goodsInfo = this.data.info;
    goodsInfo.name = goodsInfo.goods_name;
    goodsInfo.num = 1;
    goodsInfo.now_price = this.data.info.groups_price;
    goodsInfo.image = this.data.info.img_url_0;
    goodsInfo.is_express == 0 ? goodsInfo.express_desc = '自提':goodsInfo.express_desc = '寄送'
    var data = []
    data.push(goodsInfo)
    wx.setStorage({
      key: 'orderList',
      data: data,
    })

    wx.navigateTo({
      url: '/pages/mall/confirm_order/confirm_order?origin=detail&istuan=true&join=' + self.data.getHead.id,
    })
  },
  //计算倒计时
  calcTime(nowDate, endTime){
    var self = this;
    var diffTime = {};
    diffTime.showDay = false
    var diffDate = endTime - nowDate
    diffTime.day = Math.floor(diffDate / 86400)
    var dayRemain = diffDate % 86400
    diffTime.hour = self.formatNumber(Math.floor(dayRemain / 3600))
    var hourRemain = diffDate % 3600
    diffTime.minute = self.formatNumber(Math.floor(hourRemain / 60))
    diffTime.second = self.formatNumber((diffDate % 60).toFixed(0));

    (diffDate / 86400) > 1 ? diffTime.showDay = true : diffTime.showDay;
    var addTime = parseInt(self.data.info.addTime)

    var nowTime = Math.round(new Date().getTime() / 1000)
    self.setData({
      diffTime: diffTime,
      isOverTime: addTime>nowTime? true:false,
    })
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  navigateTo(e){
    Api.Utils.href(e);
  },
  onShareAppMessage: function () {
    return {
      title:'快来参加拼团活动！',
      path: '/pages/mall/tuan/tuan?fatherid=' + this.data.getHead.id
    }
  },
  onPullDownRefresh: function () {
    this.queryData();
  },
})
