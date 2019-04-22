var utils = require("../../../utils/util.js")
import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    showPage: false,
  },
  onShow: function () {
    app.viewRecord();//活跃度统计
    this.queryData();
  },
  queryData() {
    var self = this;
    Api.authGet('/member/index', {}, function (res) {
      wx.hideLoading();
      console.log(res)
      if (res.data.code == 130104 || res.data.code == 130105){
        wx.redirectTo({
          url: '../member_reg/member_reg'
        })
      }else{
        let cardBackground = res.data.memberInfo.cardBackground
        let reg = /\/\//g
        let isImg = reg.test(cardBackground)

        wx.getStorage({
          key: 'keepData',
          success: function (result) {
            self.setData({
              showPage: true,
              integralAlias:res.data.integralAlias,
              company: result.data.company,
              carInfo: result.data.have_car_info,
              memberInfo: res.data.memberInfo,
              isImg: isImg,
              cardBackground: cardBackground
            })
          }
        })
      }
    },function(err) {
      Api.Utils.toast(err.msg);
      setTimeout(() => {
        wx.navigateBack();
      }, 1500)
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  }
})