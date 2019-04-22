var utils = require("../../../utils/util.js")
import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    showMask:false,
    showPopus:false,
    itemData:{
      preBaoYangTime:'未设置',
      preBaoYangKm: '未设置',
      nextBaoYangTime: '未设置',
      nextBaoYangKm: '未设置',
    },
    showPage:false,
  },
  onLoad (){
    wx.showLoading({
      title: '加载中...',
    })
  },
  onShow (){
    this.queryData()
  },
  queryData(){
    var self = this;
    Api.authPost('/by-wx/index', {}, function (res) {
      console.log(res)
      if (res.data.preBaoYangKm !== '-') {
        var itemData = res.data;
        self.setData({
          showPage: true,
          isAdd:false,
          itemData: itemData,        
        })
      }else{
        self.setData({
          showPage: true,
          isAdd: true,
          itemData: {
            preBaoYangTime: '未设置',
            preBaoYangKm: '未设置',
            nextBaoYangTime: '未设置',
            nextBaoYangKm: '未设置',  
          }
        })
      }
      wx.hideLoading();
    })
  },
  navigateTo: function (e) {
    utils.href(e);
  }
   
})
