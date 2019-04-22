//index.js
var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
//获取应用实例
var app = getApp()
Page({
  data: {
    statuImage:'../../../images/appoint-status-cancel.png',
    statuText:'您提交的预约已经取消！',
    
  },
  onLoad (){
    app.viewRecord();//活跃度统计

    this.setData({
      carType: 'mustang 2017款 2.3t 运动版'
    })
  },
  appointEvaHref (){
    wx.navigateTo({
      url: '../appoint_evaluate/appoint_evaluate',
    })
  },
  callNum(e){
    var num = e.currentTarget.id;
    wx.makePhoneCall({
      phoneNumber: num
    })
  }
  
})
