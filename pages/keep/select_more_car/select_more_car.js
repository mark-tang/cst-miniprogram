//index.js

var utils = require("../../../utils/util.js");
import Api from "../../../utils/api.js";
//获取应用实例
var app = getApp()
Page({
  data: {
    carList: []
  },
  inputChange (e){
    var value = e.detail.value;
    this.setData({
      value:value
    })
  },
  searchPost(){
    var self = this;
    var value = this.data.value;
    wx.showLoading({
      title: '查询中...',
    })
    Api.authPost('/common/car-search',{
      keyword: value
    },function(res){
      var res = res.data;
      var carList = res
      for (var i in carList){
        if(i == 0){
          console.log(carList[i])
          carList[i].show = true
        }else{
          carList[i].show = false
        }
      }
      
      self.setData({
        carList: carList
      })
      wx.hideLoading();
    })
  },
  //选择车型
  selectCar:function(e){
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 3];

    let selectData = Object.assign(e.currentTarget.dataset, { isCar: true });
    prevPage.setData(selectData);
    wx.navigateBack({ delta: 2 })
  }
})
