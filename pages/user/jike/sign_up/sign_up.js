import Api from "../../../../utils/api.js";
import { isMobile, isVehicleNumber, toPrepageData} from "../../../../utils/util";
var WxParse = require('../../../../utils/wxParse/wxParse.js');
var app = getApp()
Page({
  data: {
    showPage: false,
    showSwiper: false,
    carInfo:[],
    isChecked: true, // 是否勾选诚意金
    isPaying:false,
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    this.setData({
      activeInfo:options
    })
    if (options.type == 1) {
      this.getCustomerInfo()
    }else if (options.type == 2){
      this.getUserinfo()
    }else{
      this.setData({
        showPage: true,
      })
    }
  },
  // 获取潜客信息
  getCustomerInfo() {
    let self = this;
    app.getCustomerInfo().then(response => {
      const { isExsit, customer_info } = response;
      self.setData({
        name: customer_info.name,
        phone: customer_info.tel,
        style_id: customer_info.car_id,
        love_car: customer_info.car_name || '请选择',
        showPage: true,
      });
    });
  },
  // 获取车主信息
  getUserinfo() {
    let self = this;
    Api.authGet("/owner/getinfo",{},(res) => {
      console.log(res)
      self.setData({
        name: res.data.u_name,
        phone: res.data.u_phone,
        model_id: res.data.u_car_model_id,
        love_car: res.data.u_car_model_name || '请选择',
        carNumber: res.data.u_chepai,
        showPage: true,
      })
    })
  },
  checkChange(){
    let isChecked = this.data.isChecked;
    this.setData({
      isChecked: !isChecked,
    })
  },
  submitForm(e){
    let self = this;
    let activeType = this.data.activeInfo.type;
    let params = {
      id: this.data.activeInfo.id,
      user_phone: e.detail.value.phone,
      user_name: e.detail.value.name,
      join_type: this.data.activeInfo.from || 0,
      is_app: 1,
    }
    if (this.data.activeInfo.need == 1) { 
      params.is_pay_now = self.data.isChecked ? self.data.activeInfo.need : 0;
    } else { 
      params.is_pay_now = self.data.activeInfo.need
    }
    
    if (activeType == 1) {
      params.style_id = self.data.style_id;
    }
    if (activeType == 2) {
      params.model_id = self.data.model_id;
      params.chepai = e.detail.value.chepai;
    }
    //表单验证
    if (!params.user_name) { app.showToast('请填写姓名'); return };
    if (!params.user_phone) { app.showToast('请填写联系方式'); return };
    if (!isMobile(params.user_phone)) { app.showToast('手机号码错误'); return };
    if (activeType === 1 && !params.style_id) { app.showToast('请选择车型'); return};
    if (activeType === 2 && !params.model_id) { app.showToast('请选择车型'); return };
    if (activeType === 2 && !params.chepai) { app.showToast('请填写车牌'); return };
    if (activeType === 2 && !isVehicleNumber(params.chepai)) { app.showToast('车牌填写有误'); return };
    
    console.info('表单数据通过验证');
    
    Api.authPost('/activity/jike/join', params, res => {
      // 不需要支付
      if (res.data.pay_info.js_pay_config.length === 0) { 
        // 签到入口过来
        if (self.data.activeInfo.sign == 'true') {
          wx.navigateTo({
            url: `../sign/sign?id=self.data.activeInfo.id&tel=${params.user_phone}`,
          })
        } else {
          wx.navigateBack({ delta: 1 })
        }
      } else {
        self.setData({ isPaying: true})
        self.wechatPay(res.data.pay_info.js_pay_config, params.user_phone);
      }
    })
  },
  wechatPay(data, tel) {
    let self = this;
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': data.signType,
      'paySign': data.paySign,
      'success': function (res) {
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 1500,
        })
        self.setData({ isPaying: false })
        setTimeout(res => {
          if (self.data.activeInfo.sign != 'true') {
            if (self.data.isChecked) {
              wx.navigateTo({
                url: `../payment/payment?isFail=false&id=${self.data.activeInfo.id}&payAmount=${self.data.activeInfo.amount}`,
              })
            } else {
              wx.navigateBack({ delta: 1})
            }
          } else {
            if (self.data.activeInfo.isSign == 'true') { // 报过名的签到
              wx.navigateBack({ delta: 1 })
            } else {
              wx.navigateTo({
                url: `../sign/sign?isFail=false&id=${self.data.activeInfo.id}&tel=${tel}`,
              })
            }
          }
        }, 1500)
        
      },
      'fail': function (res) {
        console.log(res)
        self.setData({ isPaying: false })
        Api.Utils.toast('支付失败');
        setTimeout(res => {
          if (self.data.activeInfo.sign != 'true') {
            if (self.data.isChecked) {
              wx.navigateTo({
                url: '../payment/payment?isFail=true&id=' + self.data.activeInfo.id,
              })
            } else {
              wx.navigateBack({ delta: 1})
            }
          } else {
            if (self.data.activeInfo.isSign == 'true') {
              wx.navigateBack({ delta: 1})
            } else {
              wx.navigateTo({
                url: `../sign/sign?isFail=false&id=${self.data.activeInfo.id}&tel=${tel}`,
              })
            }
          }
        }, 1500)
      }
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  }
})
