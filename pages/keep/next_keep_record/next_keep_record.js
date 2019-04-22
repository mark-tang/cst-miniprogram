var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
var app = getApp()

var nowPage = 1;
var pageCount = 1;
Page({
  data: {
    queryData:[],
    loadOver:false,
  },
  onLoad (){
    app.viewRecord();//活跃度统计
    nowPage = 1;
    pageCount = 1;
    this.queryList();
  },
  //查询数据
  queryList (){
    console.log(nowPage + ' ' + pageCount)
    var self = this;
    if (nowPage > pageCount){
      self.setData({
        loadOver: true
      })
    }else{
      wx.showLoading({
        title: '加载中...',
      })
      Api.authPost('/by-wx/record', {
        page: nowPage
      }, function (res) {
        if (res.data.list.data.length > 0){
          var res = res.data;
          if (!res.totalMoney) {
            res.totalMoney = 0;
          }

          var queryData = self.data.queryData;
          queryData = queryData.concat(res.list.data)
          self.setData({
            queryData: queryData,
            listLength: res.list.page.total_count,
            totalMoney: res.totalMoney,
          })
          nowPage++
          pageCount = res.list.page.page_count;
        }else{
          self.setData({
            showEmpty:true,
          })
        }
        wx.hideLoading();
      })
    }

  },
  onReachBottom: function () {
    this.queryList()
  },
  //删除记录
  delRecord(e) {
    var self = this;
    wx.showModal({
      title: '',
      content: '确定删除该项保养维修记录',
      success: function (res) {
        if (res.confirm) {
          var id = e.currentTarget.id        
          var index = e.currentTarget.dataset.index;
          Api.authPost('/by-wx/del',{
            id:id,
          },function(res){
            wx.setStorage({
              key: 'isReload',
              data: 'true',
            })
            var res = res.data;
            var queryData = self.data.queryData;
            var listLength = self.data.listLength-1;
            var totalMoney = self.data.totalMoney - queryData[index].b_money;
            queryData.splice(index,1);
            self.setData({
              queryData: queryData,
              listLength: listLength,
              totalMoney: (totalMoney).toFixed(2),
              toast:{show:false}
            })
          })
          
        }
      }
    })
    
  }
   
})
