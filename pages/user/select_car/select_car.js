//index.js

var utils = require("../../../utils/util.js");
import Api from "../../../utils/api.js";
//获取应用实例
var app = getApp()
Page({
  data: {
    showPage: false,
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    var self = this;
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      type: options.type,
    })
    Api.authPost('/v2/common/model-list', {}, function (res) {
      var carList = res.data
      for (var i in carList) {
        if (i == 0) {
          console.log(carList[i])
          carList[i].show = true
        } else {
          carList[i].show = false
        }
      }
      self.setData({
        showPage: true,
        carList: carList
      })
      wx.hideLoading();
    })
  },
  //选择车型
  selectCar: function (e) {
    var manufactureid = e.currentTarget.dataset.manufactureid;
    var modelid = e.currentTarget.dataset.modelid;
    var modelname = e.currentTarget.dataset.modelname;

    var type = this.data.type;
    if (type == 'like') {
      utils.toPrepageData({
        carLike: {
          manufactureid: manufactureid,
          modelid: modelid,
          modelname: modelname,
          isCar: true,
        }
      })
    } else if (type == 'origin') {
      utils.toPrepageData({
        carOrigin: {
          manufactureid: manufactureid,
          modelid: modelid,
          modelname: modelname,
          isCar: true,
        }
      })
    }
    wx.navigateBack({
      delta: 1
    })
  },
  //列表抽屉
  showChild(e) {
    var index = e.currentTarget.id;
    console.log(index)
    var list = this.data.carList;
    list[index].show = !list[index].show;
    this.setData({
      carList: list
    })
  },
  navigateTo: function (e) {
    utils.href(e)
  }
})