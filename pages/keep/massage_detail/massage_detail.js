//index.js

import Api from "../../../utils/api.js";
var WxParse = require('../../../utils/wxParse/wxParse.js');
var app = getApp();
//获取应用实例

Page({
  data: {
    showPage: false,
    articleData: {
      "title": "尊敬的车主小鹏,您好您提交的续保询价我们已经收到",
      "imgUrl": "http://img20.autoeo.com/common/20170320/e69ddb604ecdcf1892af2d6916aa1c55.jpg",
      "content": "<p>我是解析的html文章内容<br/></p><p><img alt=\"\" data-wxsrc=\"http://mmbiz.qpic.cn/mmbiz_jpg/PZuBs4sVFXba9hPKWEhY83gC7BDMFdnC89kwbTNp3A3groZnvVz2TMLYhwKfiaxZ0w6jokv7bsYjlSgaWc5LOew/0?wx_fmt=jpeg\" src=\"http://img20.autoeo.com/common/20170320/e69ddb604ecdcf1892af2d6916aa1c55.jpg\"/></p>",
      "fromUrl": null
    },
    title: '',
    time: 1498104000000,
    formatTime: '',
    isShowAppoint: false,
    phone: '15610141518',
    showPhone: false,
    showArticle: false,
    moreArticleList: {},
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
    this.queryData(options.id);
    this.setData({
      id: options.id
    })
  },
  queryData(id) {
    var self = this;
    wx.showLoading({
      title: '加载中...',
    })
    Api.authGet('/news/view', {
      id: id
    }, function (res) {
      var article = '<div>我是解析的HTML代码</div><br><span>我是span</span><br><a>我是a标签</a>';
      var article = res.data.content;
      WxParse.wxParse('article', 'html', article, self, 10);

      self.setData({
        showPage: true,
        title: res.data.title,
      })
      
    })
  }
})