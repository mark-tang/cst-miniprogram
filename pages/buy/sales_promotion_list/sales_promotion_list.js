import Api from "../../../utils/api.js";
var app = getApp();
Page({
  data: {
    listData:{},
    tabID: 1,
    emptyText:'',
    showEmpty:false,
    showPage:false,
    page:1,
    pageCount:null,
  },
  onLoad: function () {
    this.queryData(1);
    app.viewRecord();//活跃度统计
  },
  queryData(){
    wx.showLoading({title: '加载中...'})
    var self = this;
    let type = this.data.tabID;
    Api.authPost('/sell-sales/index?page=' + this.data.page,{
      type: type,
    },function(res){
      var emptyText
      if (type == 1) {
        emptyText = "暂无优惠促销信息";

      } else if (type == 2) {
        emptyText = "暂无新闻动态";

      } else if (type == 3) {
        emptyText = "暂无车型评测信息";

      }
      self.setData({
        titleData: res.data.title,
        listData: [...self.data.listData, ...res.data.list.data],
        emptyText: emptyText,
        pageCount: res.data.list.page.page_count,
      })
      self.setData({
        titleData: res.data.title,
        listData: [...self.data.listData, ...res.data.list.data],
        emptyText: emptyText,
        pageCount: res.data.list.page.page_count,
      })
      if (res.data.list.data.length > 0){
        self.setData({
          showEmpty: false,
          showPage: true,
        })
      }else{

        self.setData({
          showEmpty: true,
          showPage: true,
        })
      }  
    })
  },
  tabSelect: function (e) {
    var id = e.target.dataset.id;
    this.setData({
      listData: [],
      page:1,
      tabID: id,
    })
    this.queryData()
  },
  navigateTo: function (e) {
    Api.Utils.href(e);
  },
  onReachBottom() {
    let self = this;
    let page = this.data.page;
    let pageCount = this.data.pageCount;
    if (page < pageCount) {
      page++
      self.setData({
        page: page
      })
      self.queryData()
    }
    
  },
  onShareAppMessage: function () {
    return {
      title: '购车优惠',
      path: '/pages/buy/sales_promotion_list/sales_promotion_list'
    }
  }
})