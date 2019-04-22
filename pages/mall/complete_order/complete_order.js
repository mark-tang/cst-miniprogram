import Api from '../../../utils/api.js'

//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    listData: [
      
    ],
    showCode:false,

  },
  onLoad(){
    app.viewRecord();//活跃度统计
    var self = this;
    var listData = this.data.listData;
  },
  showCode(){
    var showCode = this.data.showCode;
    this.setData({
      showCode: !showCode
    })
  },
  navigateTo(e){
    Api.Utils.href(e);
  },
  complete(){
    wx.navigateBack({delta: 1})
  }
})
