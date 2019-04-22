import Api from "../../../utils/api.js"
let app = getApp();
var page = 0;  
var cashProgress = false; //杀掉请求进程
Page({
  data: {
    list: [],
    showPage:false,
  },

  onLoad: function (options) {
    this.setData({
      list: []
    })
    cashProgress = false
    wx.showLoading({title: '加载中...'});
    var self = this
    Api.authPost('/show-cars/index', {}, function (res) {
      var list = res.data
      self.setData({
        list: list
      })
      self.getModel() 
    })
  },
  onShow(){
    page = 0;
    app.viewRecord();//活跃度统计
  },
  onUnload (){   
    cashProgress = true;
    page = 0;
  },
  getModel(){
    var self = this
    var list = this.data.list;
    if(page<1){
      wx.showLoading({ title: '加载中...' });     
    }else{
      self.setData({ showPage: true })
    }
    if(!cashProgress){
      if (page < list.length) {
        Api.authPost('/show-cars/index-model', { cat_id: list[page].cat_id }, function (res) {
          list[page].carModels = res.data
          self.setData({
            list: list
          })
          page++
          //递归调用
          self.getModel()
        })
      }
    }

  },
  onShareAppMessage: function () {
    return {
      title:'新车展厅',
      //path: '/pages/buy/new_car_list/new_car_list'
      path: '/pages/buy/index/index',
    }
  }
})