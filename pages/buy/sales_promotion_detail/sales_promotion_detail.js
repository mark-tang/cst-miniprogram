//index.js

import Api from "../../../utils/api.js";
var WxParse = require('../../../utils/wxParse/wxParse.js');
//获取应用实例
var app = getApp();
Page({
  data: {
    showPage:false,
    articleData:{
      "title": "尊敬的车主小鹏,您好您提交的续保询价我们已经收到",
      "imgUrl": "http://img20.autoeo.com/common/20170320/e69ddb604ecdcf1892af2d6916aa1c55.jpg",
      "content": "<p>我是解析的html文章内容<br/></p><p><img alt=\"\" data-wxsrc=\"http://mmbiz.qpic.cn/mmbiz_jpg/PZuBs4sVFXba9hPKWEhY83gC7BDMFdnC89kwbTNp3A3groZnvVz2TMLYhwKfiaxZ0w6jokv7bsYjlSgaWc5LOew/0?wx_fmt=jpeg\" src=\"http://img20.autoeo.com/common/20170320/e69ddb604ecdcf1892af2d6916aa1c55.jpg\"/></p>",
      "fromUrl": null
    },
    title:'',
    time: 1498104000000,
    formatTime:'',
    isShowAppoint:false,
    phone:'15610141518',
    showPhone:false,
    showArticle: false,
    moreArticleList:{},
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
    this.queryData(options.id);
    this.setData({
      id:options.id
    })
    let type = options.type;
    if (type == 1) {
      wx.setNavigationBarTitle({
        title: '优惠促销详情'
      })
    } else if (type == 2) {
      wx.setNavigationBarTitle({
        title: '新闻动态详情'
      })
    } else if (type == 3) {
      wx.setNavigationBarTitle({
        title: '车型评测详情'
      })
    }
  },
  
  contact (e){
    var phoneNum = e.currentTarget.dataset.phone;
    console.log(phoneNum)
    wx.makePhoneCall({
      phoneNumber: phoneNum,
    })
  },
  queryData(id) {
    var self = this;
    wx.showLoading({
      title: '加载中...',
    })
    Api.authPost('/sell-sales/promo', {
      id:id
    }, function (res) {
      var article = res.data.promo.details;
      
      WxParse.wxParse('article', 'html', article, self, 10);
      
      self.setData({
        showPage: true,
        title: res.data.promo.title,
        formatTime: res.data.promo.addtime,       
      })
      if (res.data.list.data.length > 0){
        self.setData({
          showArticle:true,
          moreArticleList: res.data.list.data,
        })
      }
      if (res.data.tel.sellerPhone){
        self.setData({
          phone: res.data.tel.sellerPhone,
          showPhone:true,
        })
      }
    })
  },
  refreshArt(e){
    this.queryData(e.currentTarget.dataset.id)
  },
  onShareAppMessage: function () {
    var self = this;
    return {
      title: self.data.title,
      path: '/pages/buy/sales_promotion_detail/sales_promotion_detail?method=share' + '&id=' + self.data.id,
      success: function (res) {
        // 转发成功

      },
      fail: function (res) {

      }
    }
  }
})