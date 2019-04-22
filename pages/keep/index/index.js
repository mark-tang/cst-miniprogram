//index.js
import Api from "../../../utils/api.js";
var app = getApp();
//获取应用实例

Page({
  data: {
    have_car_info: true,    // 汽车
    isPeccancy: true,  //违章
    isCare: true,     // 保养
    isInsurance: true, // 保险
    isYearCheck: true,  // 年检
    peccancyWord: '违章查询',
    carInfo: {},
    have_car_info: false,
    // linkToAddInfo: true,
    isShowCarInfo: true,
    showPage: false,
    hasSession: false,
    showMember: 0,
    menuData: [
      { title: '养修预约', icon: '/images/menu1.png', url: '../appoint_add/appoint_add', isNeedInfo: 'true' },
      { title: '续保询价', icon: '/images/menu2.png', url: '../renewal_add/renewal_add', isNeedInfo: 'true' },
      { title: '道路救援', icon: '/images/menu3.png', url: '../road_help/road_help', isNeedInfo: 'false' },
      { title: '二手车置换', icon: '/images/menu5.png', url: '../second_handcarexchange/second_handcarexchange', isNeedInfo: 'true' },
      // { title: '车主宝典', icon: '/images/menu4.png', url: '../webview/webview', isNeedInfo: 'false' },
      { title: '会员卡', icon: '/images/menu7.png', url: '../member/member', isNeedInfo: 'false' },
    ]
  },

  onPullDownRefresh: function () {
    this.queryData();
  },
  onShow() {
    app.viewRecord();//活跃度统计
    this.queryData();
    this.getMenber();
    var self = this;
    wx.getStorage({
      key: 'isReload',
      success: function (res) {
        if (res.data == 'true') {
          self.queryData();
        }
      },
    })
    this.getHelpStatus();
  },
  getMenber() {
    var self = this;
    Api.authPost('/member/validate-member', {}, function (res) {
      if (res.data.validate) {
        self.setData({
          isMember: true
        })
      } else {
        self.setData({
          isMember: false
        })
      }
    })
  },
  getHelpStatus() {
    var self = this;
    var hasSession = this.data.hasSession;
    if (hasSession) {
      Api.authGet('/support/index', {}, function (res) {
        let hasSupport = false;
        if (res.data.has_support) {
          hasSupport = true;
          wx.setStorage({
            key: 'helpId',
            data: res.data.has_support,
          })
          wx.setStorage({
            key: 'helpTel',
            data: res.data.support_phone,
          })
        } else {
          hasSupport = false;
        }
        self.setData({
          hasSupport: hasSupport,
        })
      })
    }

  },
  toRoadHelp() {
    if (this.data.hasSupport) {
      wx.navigateTo({
        url: '../road_help_wait/road_help_wait'
      })
    } else {
      wx.navigateTo({
        url: '../road_help/road_help'
      })
    }
  },
  onShareAppMessage: function () {
    return {
      title: '养车',
      path: '/pages/keep/index/index'
    }
  },
  queryData() {
    var self = this;
    //请求初始数据
    Api.authPost('/owner/validate-fans', {}, function (res) {
      self.setData({
        isShowCarInfo: !res.data.status
      })

    })
    Api.authPost('/after/default/index', {}, function (res) {
      var res = res.data;
      //获取车主资料
      Api.authPost('/owner/getinfo', {}, function (res) {
        var carInfo = res.data.cars[0] || {};
        if (!carInfo.carImage) {
          carInfo.carImage = '/images/bluecar.png';
        }
        self.setData({
          carInfo: carInfo
        })
      })
      console.log(res)

      self.setData({
        showMember: res.company.enableMember,
      })
      if (res.extend_info.peccancyCount != undefined) {
        self.setData({
          peccancyDay: res.extend_info.peccancyCount,
          isPeccancy: false,
          peccancyWord: '违章记录',
        })
      }
      if (res.extend_info.baoyang == 0 || res.extend_info.baoyang) {

        self.setData({
          baoyang: res.extend_info.baoyang,
          isCare: false,
        })
      } else {
        self.setData({
          baoyang: res.extend_info.baoyang,
          isCare: true,
        })
      }
      if (res.extend_info.baoxian == "0" || res.extend_info.baoxian) {
        self.setData({
          baoxian: res.extend_info.baoxian,
          isInsurance: false,
        })
      } else {
        self.setData({
          baoxian: res.extend_info.baoxian,
          isInsurance: true,
        })
      }
      if (res.extend_info.nianjian == "0" || res.extend_info.nianjian) {
        self.setData({
          nianjian: res.extend_info.nianjian,
          isYearCheck: false,
        })
      } else {
        self.setData({
          nianjian: res.extend_info.nianjian,
          isYearCheck: true,
        })
      }
      // if (res.have_car_info.che_ming) {
      //   self.setData({
      //     isShowCarInfo: false,
      //   })
      // }
      // res.advisor = {}
      let advisor = {}      
      if (res.archive) {
        if (res.archive.saName){
          advisor = { name: res.archive.saName, phone: res.archive.saTel, id: res.archive.serviceId,tip:'SA' }
        }else if (res.archive.serviceName) {
          advisor = { name: res.archive.serviceName, phone: res.archive.serviceTel, id: res.archive.serviceId, tip: '客服' }
        }else{
          advisor = { name: '', phone: res.company.call, id: '',tip:'门店' }
        }
      } else {
        advisor = { name: '', phone: res.company.call, id: '', tip: '门店'  }
      }

      self.setData({
        company: res.company,
        advisor: advisor,
        // carInfo: res.have_car_info,
        // linkToAddInfo: res.extend_info.linkToAddInfo,
        showPage: true,
        hasSession: true,
      })
      wx.setStorage({
        key: "keepData",
        data: res
      })
      wx.setStorage({
        key: 'isReload',
        data: 'false',
      })
      self.getHelpStatus()
      wx.stopPullDownRefresh()
      wx.hideLoading()
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
        itemList: ['联系客服', '客服点评'],
        success: function (res) {
          if (res.tapIndex == 0) {
            wx.makePhoneCall({
              phoneNumber: phoneNum //仅为示例，并非真实的电话号码
            })
          } else if (res.tapIndex == 1) {
            wx.navigateTo({ url: `/pages/keep/advisor_evaluate/advisor_evaluate?id=${id}&type=1` })
          }
        }
      })
    }
  },
  openLoc() {
    var self = this;
    wx.openLocation({
      latitude: Number(self.data.company.lat),
      longitude: Number(self.data.company.long),
      scale: 28,
      name: self.data.company.name,
      address: self.data.company.address
    })
  },
  goAddCar(e) {
    Api.authPost('/data/maidian', { type: 8 }, function (res) { console.log(8) })
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  navigateTo: function (e) {
    let self = this;
    let isLink = e.currentTarget.dataset.islink;
    // let linkToAddInfo = self.data.linkToAddInfo;
    //  判断道路救援的情况
    if (e.currentTarget.dataset.url == '../road_help/road_help' && this.data.hasSupport) {
      wx.navigateTo({
        url: '../road_help_wait/road_help_wait',
      })
      return
    }
    //会员信息
    if (e.currentTarget.dataset.url == '../member/member') {
      console.log(self.data.isMember)
      if (self.data.isMember)
      { Api.Utils.href(e); } else {
        wx.showToast({
          icon: 'none',
          title: '您不是经营品牌范围内的车主，暂时无法注册会员',
        })
      }
      return
    }
    if (isLink == 'false') {
      Api.Utils.href(e);
      return;
    };


    if (self.data.isShowCarInfo) {
      wx.showModal({
        title: '提示',
        content: '请先添加您的爱车',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../add_car/add_car?type=add',
            })
          }
        }
      })
    } else {
      Api.Utils.href(e);
    }
    // else{
    //   wx.showModal({
    //     title: '提示',
    //     content: '请先完善您的资料',
    //     success(res) {
    //       if (res.confirm) {
    //         wx.navigateTo({
    //           url: '../add_car/add_car?type=supply',
    //         })
    //       }
    //     }
    //   })

    // }



  }
})