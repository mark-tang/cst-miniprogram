import Api from "../../../utils/api.js";
var nowPage = 1;
var pageCount = 1;
var app = getApp()
Page({
  data: {
    showPage:false,
  },
  onLoad: function (options) {
    this.setData({
      coin:options.coin,
      growth: options.growth,
      name: options.name
    })
  },
  onShow(){
    app.viewRecord();//活跃度统计
    this.queryLeave();
    this.queryRecord();
  },
  queryLeave() {
    let self = this;
    let coin = this.data.coin;
    let growth = this.data.growth;
    Api.authPost('/member/level-enum', {}, function (res) {
      let levelData = res.data.enum;
      let nextInteger = res.data.integralConfig.integral_exchange_value;
      let LevelIndex = 0;
      let tips = res.data.integralConfig.how;
      for (let i in levelData){
        if (growth >= levelData[i].range_min && growth < levelData[i].range_max){
          LevelIndex = Number(i)
        }
      }
      self.setData({
        levelData: levelData,
        tips: tips,
        nextInteger: nextInteger,
        LevelIndex: LevelIndex,
        addIndex : LevelIndex +1,
        showPage:true
      })
      wx.hideLoading();
    })
  },
  queryRecord() {
    let self = this;
    if (nowPage > pageCount) {
      self.setData({
        loadOver: true
      })
    }else{
      Api.authPost('/member/integral-record', {
        page: nowPage,
      }, function (res) {
        self.setData({
          growRecord: res.data.data,
        })
        nowPage++
        pageCount = res.data.page.page_count;
        wx.hideLoading();
      })
    }
    
  },
  intoShop:function(e){
    wx.switchTab({
      url: '/pages/mall/index/index'
    })
  },
  navigateTo: function (e) {
    Api.Utils.href(e)
  },
  onReachBottom: function () {
    // this.queryData()
    console.log(123)
  },
})