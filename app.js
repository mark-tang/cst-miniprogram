//app.js
import Api from 'utils/api';

App({
  Api: Api,
  onLaunch() {
    this.showToast = (title) => {
      wx.showToast({
        icon: 'none',
        title: title,
      })
    }
    
  },
  onShow(options) {
    this.scene = options.scene
  },
  post (_url, _data, _header) {
    return Api.request('POST', _url, _data, _header);
  },

  get (_url, _data, _header) {
    return Api.request('GET', _url, _data, _header);
  },
  //统计活跃度
  viewRecord() {
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    var url = currentPage.route    //当前页面url
    let parma = { frontend_type: 2, remark: url }
    Api.authBase("POST", '/tongji/view-record', parma)
  },
  
  globalData:{
    locationInfo: null,
    customerInfo: null, // 潜客信息
    tabBar: {
      "color": "#aeaeae",
      "selectedColor": "#4c76fa",
      "borderStyle": "#d0d0d0",
      "list": [
        {
          "selectedIconPath": "/images/tab1-press.png",
          "iconPath": "/images/tab1-normal.png",
          "pagePath": "/pages/buy/index/index",
          "text": "买车",
          "selected":true,
          "show":true,
        },
        {
          "selectedIconPath": "/images/tab2-press.png",
          "iconPath": "/images/tab2-normal.png",
          "pagePath": "/pages/keep/index/index",
          "text": "养车",
          "selected": false,
          "show": true,
        },
        {
          "selectedIconPath": "/images/tab3-press.png",
          "iconPath": "/images/tab3-normal.png",
          "pagePath": "/pages/mall/index/index",
          "text": "商城",
          "selected": false,
          "show": false,
        },
        {
          "selectedIconPath": "/images/tab4-press.png",
          "iconPath": "/images/tab4-normal.png",
          "pagePath": "/pages/user/index/index",
          "text": "我的",
          "selected": false,
          "show": true,
        }
      ]
    }
  },
  //初始化 tabbar
  initTabBar: function () {
    var tabbar = this.globalData.tabBar,
      currentPages = getCurrentPages(),
      self = currentPages[currentPages.length - 1],
      pagePath = self.__route__;
    (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
    for (var i in tabbar.list) {
      tabbar.list[i].selected = false;
      (tabbar.list[i].pagePath == pagePath) && (tabbar.list[i].selected = true);
    }
    tabbar.list[2].show = wx.getStorageSync('hasMall') == 'true' ?true:false;
    self.setData({
      tabbar: tabbar
    })
  },
  //获取用户地理坐标
  getLocationInfo: function (callback,isReload) {
    var that = this;
    if (isReload){
      that.weLocation(callback)
    }else{
      if (that.globalData.locationInfo) {
        console.log("调用全局变量")
        callback(that.globalData.locationInfo)
      } else {
        that.weLocation(callback)
      }
    }

  },
  //小程序坐标接口
  weLocation: function (callback){
    var that = this;
    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        that.globalData.locationInfo = res;
        callback(res)
      },
      fail: function () {

      },
    })
  },
  //获取设备信息
  getSystemInfo (cb,errorHandle) {
    var self = this;
    wx.getSystemInfo({
      success: function (res) {
        cb(res)
      },fail:function (res){
        errorHandle(res)
      }
    })

  },
  // 获取潜客信息
  getCustomerInfo () {
    return new Promise((resolve, reject) => {
      if (!this.globalData.customerInfo) {
        this.get('/customer/index').then(response => {
          const {code, data, msg} = response;
          if (code == 200) {
            this.globalData.customerInfo = {
              customer_info: data,
              isExist: true
            }
          } else {
            this.globalData.customerInfo = {
              customer_info: {},
              isExist: false
            }
          }
          console.log('线上同步潜客信息');
          resolve(this.globalData.customerInfo);
        });
      } else {
        console.log('本地同步潜客信息');
        resolve(this.globalData.customerInfo);
      }
    }) 
  },
  //获取商家信息
  getServiceInfo (cb){
    var self = this
    if (self.globalData.serviceInfo) {
      typeof cb == "function" && cb(self.globalData.serviceInfo)
    } else {
      Api.authPost('/common/contact',{},function(res){
        self.globalData.serviceInfo = res.data
        typeof cb == "function" && cb(self.globalData.serviceInfo)
      })
    }
  },
  //购物车数量
  getShopcarCount(cb){
    var self = this
    if(self.globalData.shopcarCount){
      typeof cb == "function" && cb(self.globalData.shopcarCount)
    }else{
      Api.authPost('/mall/cart/list',{},function(res){
        var shopcarCount = 0
        res.data.list.data.forEach(function(item){
          shopcarCount = shopcarCount + item.num
        })
        self.globalData.shopcarCount = shopcarCount
        typeof cb == "function" && cb(self.globalData.shopcarCount)
      })
    }
  },
  //更新购物车数量
  refreshShopcarCount(shopcarCount){
    this.globalData.shopcarCount = shopcarCount 
  }
})