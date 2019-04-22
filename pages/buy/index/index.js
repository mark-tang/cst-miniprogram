import Api from '../../../utils/api.js'
var app = getApp();

Page({
  data: {
    showPage: false,
    showCarModel: false,
    orginDate: [],
    isExist: false,
    userStatus: false,
    isHideLoadMore: true,
    tipsList: [],
    searchList:[],
    isSearch:false,
    count: 0,
    page: 0
  },
  onLoad: function () {
    app.initTabBar();
  },
  //搜索框
  bindReplaceInput(e) {
    this.setData({
      keyword: e.detail.value
    })
  },
  //清除关键字
  clearKeyword(){
    this.setData({
      keyword: ''
    })
    this.queryData();
  },
  bindconfirm(e) {
    let keyword = this.data.keyword;
    if (keyword == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入搜索车型',
      })
      return;
    }
    let self=this;
    this.setData({
      isSearch:true
    })
    Api.authPost('/show-cars/search-model', { keyword }, function (res) {
      self.setData({
        searchList: res.data,
        isHideLoadMore: true      
      })
      //递归调用
    })
  
  },
  onShow() {
    app.viewRecord();//活跃度统计
    let self = this;
    this.queryData();
    console.log(333)
    // Api.authPost('/sell/default/index', {}, function (res) {
    //   var tipsList = [];
    //   let sale = res.data.sell_sale;
    //   // sale = []
    //   var promotion = sale;
    //   if (promotion.length == 0) {
    //     tipsList = [{ first: '暂无优惠信息', second: '' }];
    //   } else {
    //     for (var i = 0; i < promotion.length; i = i + 2) {
    //       var obj = {
    //         first: promotion[i].title || '暂无优惠信息',
    //         second: promotion[i + 1] && promotion[i + 1].title || ''
    //       }
    //       tipsList.push(obj);
    //     }
    //   }
    //   // res.data.advisor.name = ''
    //   self.setData({
    //     company: res.data.company,
    //     advisor: res.data.advisor,
    //     tipsList: tipsList,
    //     promotion: promotion,
    //   });

    // })
  },
  queryData: function (show) {
    var self = this;
    this.setData({
      isSearch: false,
      keyword:''
    })
    Api.authPost('/sell/default/index', {}, function (res) {
      var tipsList = [];
      var promotion = res.data.sell_sale;
      if (promotion.length == 0) {
        tipsList = [{ first: '暂无优惠信息', second: '' }];
      } else {
        for (var i = 0; i < promotion.length; i = i + 2) {
          var obj = {
            first: promotion[i].title,
            second: promotion[i + 1] && promotion[i + 1].title || ''
          }
          tipsList.push(obj);
        }
      }
      // res.data.advisor.name = ''
      self.setData({
        company: res.data.company,
        advisor: res.data.advisor,
        tipsList: tipsList,
        promotion: promotion,
        isHideLoadMore: true,
        page: 0,
        showPage: true,
      });
      self.getBrandList(show);

    })
  },
  getBrandList(show) {
    let self = this;
    Api.authPost('/show-cars/index', {}, function (res) {
      var list = res.data
      self.setData({
        list: list,
      })
      self.getModel(show)
    })
  },
  getModel(show) {
    var self = this
    var list = this.data.list;
    var page = this.data.page
    if (page < 1 && !show) {
      wx.showLoading({ title: '加载中...' });
    } else {
      self.setData({ showPage: true })
    }
    if (page < list.length) {
      Api.authPost('/show-cars/index-model', { cat_id: list[page].cat_id }, function (res) {
        wx.stopPullDownRefresh()
        list[page].carModels = res.data
        if (res.data.length < 3) {
          self.getModel(true)
        }
        page++
        self.setData({
          list: list,
          page: page,
          isHideLoadMore: false
        })

        //递归调用


      })
    } else {
      self.setData({
        isHideLoadMore: true
      })
    }

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getModel()

  },
  goCarDisplay(e) {
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    let params
    if (!type) {
      params = `?id=${id}&type=notype`
    } else {
      params = `?id=${id}&type=${type}`
    }
    wx.navigateTo({
      url: `../new_car_display/new_car_display${params}`
    })
  },
  openAction(e) {
    let phoneNum = e.currentTarget.dataset.phone;
    let id = this.data.advisor.id;
    const company_phone = this.data.company.call;
    if (!this.data.advisor.name) {
      wx.makePhoneCall({
        phoneNumber: company_phone
      })
      return;
    } else {
      wx.showActionSheet({
        itemList: ['联系顾问', '顾问点评'],
        success: function (res) {
          if (res.tapIndex == 0) {
            Api.authPost('/data/maidian', { type: 4 }, function (res) { })
            wx.makePhoneCall({
              phoneNumber: phoneNum //仅为示例，并非真实的电话号码
            })
          } else if (res.tapIndex == 1) {
            wx.navigateTo({ url: `/pages/keep/advisor_evaluate/advisor_evaluate?id=${id}&type=2` })
          }
        }
      })
    }

  },
  openLoc() {
    var self = this;
    Api.authPost('/data/maidian', { type: 3 }, function (res) { })
    wx.openLocation({
      latitude: Number(self.data.company.lat),
      longitude: Number(self.data.company.long),
      scale: 28,
      name: self.data.company.name,
      address: self.data.company.address
    })
  },
  navigateTo: function (e) {
    app.Api.Utils.href(e);
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.queryData(true)
  },
  onShareAppMessage: function () {
    return {
      title: '新车展厅',
      path: '/pages/buy/index/index'
    }
  }
})