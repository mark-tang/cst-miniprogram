var utils = require("../../../utils/util.js");
import Api from "../../../utils/api.js";

var app = getApp()

var startX;
var startY;
var endX;
var endY;
var key;
var maxRight = 280;
Page({
  data: {
    queryData:[]
  },
  onLoad (){
    wx.showLoading({
      title: '加载中...',
    })
  }, 
  onShow: function () {
    app.viewRecord();//活跃度统计
    this.queryData()
  },
  queryData(){

    var self = this;
    Api.authGet('/peccancy/index',{},function(res){
      self.setData({
        showEmpty: false,
        queryData:[]
      })
      var queryData = res.data;
      if (res.data.length != 0) {
        for (var i in queryData) {
          queryData[i].right = 0;
          queryData[i].startRight = 0;
          queryData[i].isOpen = false;
        }
        self.setData({
          queryData: queryData
        })
      } else {
        self.setData({
          showEmpty: true,
        })
      }
      
      wx.hideLoading()
    })
  },
  //添加
  addHref() {
    wx.navigateTo({
      url: '../peccancy_add/peccancy_add',
    })
  },
  //编辑
  editHref(e) {
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    var chepai = e.currentTarget.dataset.chepai;
    var carcode = e.currentTarget.dataset.carcode;
    var cardrivenumber = e.currentTarget.dataset.cardrivenumber;
    //复位
    let queryData= this.data.queryData;
    queryData[index].right = 0;
    this.setData({
      queryData: queryData,
    })
    var peccancyForm = {
      id: id,
      chepai: chepai,
      carcode: carcode,
      cardrivenumber: cardrivenumber
    }
    wx.setStorage({
      key: 'peccancyForm',
      data: peccancyForm,
    })
    wx.navigateTo({
      url: '../peccancy_edit/peccancy_edit',
    })
  },
  //详情
  detailHref(e) {
    var id = e.currentTarget.dataset.id;
    var chepai = e.currentTarget.dataset.chepai;
    var count = e.currentTarget.dataset.count;
    var point = e.currentTarget.dataset.point;
    var money = e.currentTarget.dataset.money;
    var queryData = this.data.queryData;
    for(var i in queryData){
      if(queryData[i].id === id){
        var list = queryData[i].peccancy.list
        wx.setStorage({
          key: 'peccancyList',
          data: list,
        })
      }
    }
    wx.navigateTo({
      url: '../peccancy_detail/peccancy_detail?chepai=' + chepai +
      '&count=' + count +
      '&point=' + point +
      '&id=' + id +
      '&money=' + money,
    })
  },
  //删除
  delItem(e) {

    var self = this;
    wx.showModal({
      content: '确认删除该车查询信息',
      success: function (res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.id;
          var dataId = e.currentTarget.dataset.index;
          Api.authPost('/peccancy/del-car',{
            id: dataId
          },function(res){
            wx.setStorage({
              key: 'isReload',
              data: 'true',
            })
            self.queryData()
          })

        }
      }
    })

  },
  drawStart : function (e) {
    var touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    var queryData = this.data.queryData;
    for (var i in queryData) {
      var data = queryData[i];
      data.startRight = data.right;
    }
    key = true;
  },
  drawEnd: function (e) {
    var queryData = this.data.queryData;
    for (var i in queryData) {
      var data = queryData[i];

      if (!data.isOpen){
        if (data.right > maxRight*.35){
          data.right = maxRight;
          data.isOpen = !data.isOpen
        }else{
          data.right = 0;
        }
      }else{
        if (data.right <= maxRight*.65) {
          data.right = 0;
          data.isOpen = !data.isOpen
        } else {
          data.right = maxRight;
        }
      }
      

    }
    this.setData({
      queryData: queryData
    });
  },
  drawMove: function (e) {
    var self = this;
    var dataId = e.currentTarget.id;
    var queryData = this.data.queryData;
    if (key) {
      var touch = e.touches[0];
      endX = touch.clientX;
      endY = touch.clientY;
      if (endX - startX == 0)
        return;
      var res = queryData;
      //从右往左  

      if ((endX - startX) < 0) {
        for (var k in res) {
          var data = res[k];
          if (k == dataId) {
            var startRight = res[k].startRight;
            var change = startX - endX;
            startRight += change;
            if (startRight > maxRight)
              startRight = maxRight;
            res[k].right = startRight;
          }
        }
      } else {//从左往右  
        for (var k in res) {
          var data = res[k];
          if (k == dataId) {
            var startRight = res[k].startRight;
            var change = endX - startX;
            startRight -= change;
            if (startRight < 0)
              startRight = 0;
            res[k].right = startRight;
          }
        }
      }
      self.setData({
        queryData: queryData
      });

    }
  }
   
})
