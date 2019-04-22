//index.js
var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";

//获取应用实例
var nowPage = 1;
var pageCount = 1;
var app = getApp()
Page({
  data: {
    listData:[]
  },
  onLoad: function () {
    app.viewRecord();//活跃度统计
    wx.showLoading({
      title: '加载中...',
    })
    nowPage = 1;
    pageCount = 1;
    this.queryData()
  },
  queryData() {
    console.log(pageCount + ' '+nowPage)
    var self = this;
    if (nowPage > pageCount) {
      wx.hideLoading()
      self.setData({
        loadOver: true
      })
    } else {
      self.setData({
        loadOver: false
      })
      wx.showLoading({ title: '加载中...', mask: true })
      Api.authGet('/news/index', {
        type: 2,
        page: nowPage ,
      }, function (res) {
        
        if (res.data.list.data.length != 0) {
          var listData = res.data.list.data;
          var exp = /(?!<?>)<.+?>/g   //去除所有标签正则
          var exp2 = /，点击查看详情。/g
          for (var i in listData) {
            var date = parseInt(listData[i].send_date * 1000)
            listData[i].send_date = Api.Utils.formatTime(new Date(date))
            
            !listData[i].content ? listData[i].content= '':''
            listData[i].content = listData[i].content.replace(exp, '')
            listData[i].content = listData[i].content.replace(exp2, '')
          }
          var orginData = self.data.listData;
          console.log(orginData)
          console.log(listData)
          listData = orginData.concat(listData)
          self.setData({
            listData: listData,
            showPage: true,
          })
          nowPage++
          pageCount = res.data.list.page.page_count;
        } else {
          self.setData({
            showEmpty: true,
          })
        }

      })

    }
    
  },
  toDatail(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../massage_detail/massage_detail?test=test' +'&id=' + id,
    })
  },
  onReachBottom: function () {
    this.queryData()
  },
  navigateTo: function (e) {
      Api.Utils.href(e);
  }
})