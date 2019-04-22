var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    showEmpty:true,
  },
  onLoad (options){
    app.viewRecord();//活跃度统计
    this.queryData(options)
    this.setData({
      options:options,
    })
  },
  queryData(options){
    //获取上页数据 初始页面
    var self = this;
    var queryData = {}
    queryData.chepai = decodeURIComponent(options.chepai);
    queryData.count = options.count;
    queryData.point = options.point;
    queryData.money = options.money;
    this.setData({
      queryData: queryData,
      id: options.id,
    })
    wx.getStorage({
      key: 'peccancyList',
      success: function(res) {
        if(res.data.length >0){
          self.setData({
            peccancyList: res.data,
            showEmpty: false
          })
        }
      },
    })
  },
  // onShareAppMessage: function () {
  //   var self = this
  //   return {
  //     title: Api.config.appName,
  //     path: '/pages/keep/peccancy_detail/peccancy_detail?type=share' + 
  //     '&chepai=' + decodeURIComponent(self.data.options.chepai) +
  //     '&count=' + self.data.options.count+
  //     '&id=' + self.data.options.id+
  //     '&money' + self.data.options.money+
  //     '&point' + self.data.options.point,
  //     success: function (res) {
  //       // 转发成功
  //       console.log(self.data.options)
  //     },
  //     fail: function (res) {

  //     }
  //   }
  // },
  refresh (){
    //调用刷新接口
    var self = this;
    wx.showLoading({
      title: '正在重新查询..',
    })
    Api.authPost('/peccancy/select',{
      id: self.data.id
    },function(res){
      var queryData = self.data.queryData;
      queryData.count = res.data.rule_count;
      queryData.point = res.data.total_point;
      queryData.money = res.data.total_money;
      var peccancyList = res.data.list;
      self.setData({
        queryData: queryData,
        peccancyList: peccancyList
      });
      wx.hideLoading()
      wx.showToast({
        title: '查询成功',
      })
      wx.stopPullDownRefresh()
    })
  },
  onPullDownRefresh: function () {   
    this.refresh()
  } 
   
})
