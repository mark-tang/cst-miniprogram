//index.js
var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
//获取应用实例
var app = getApp()
Page({
  data: {
    dateTips: '选择上牌时间',
    date: '',
    isCar:false,
    isDate:false,
    modelname: '请选择换车型号',
    modelid: '',
    showPage:false,
  },
  onLoad() {
    app.viewRecord();//活跃度统计
    this.limitDate()
    wx.showLoading({
      title: '加载中',
    })
    this.initInfo()
  },
  //初始信息加载
  initInfo (){
    var self = this;
    Api.authPost('/owner/get-car-exchange-info', {}, function (res) {
      var res = res.data;
      var isCar = true;
      var isDate = true;
      var dateTips = self.data.dateTips;
      if (!res.love_car){
        res.love_car = '请选择换车型号';
        var isCar = false;
      }
      res.shangpai ? res.shangpai : res.shangpai = 946656000
      res.shangpai = res.shangpai * 1000
      if(!res.shangpai){
        var isDate = false;        
      }else{
        dateTips = utils.formatTime2(new Date(res.shangpai))
      }
      // res.shangpai = ''
      
      self.setData({
        showPage:true,
        name: res.name,
        phone:res.phone,
        modelname: res.love_car,
        modelid: res.love_car_id,
        isCar: isCar,
        isDate: isDate,
        date: utils.formatTime2(new Date(res.shangpai)),
        dateTips: dateTips,
      })
      wx.hideLoading()
    })
   
    Api.authPost('/owner/getinfo', {}, function (res) {    
      let carSeriesName = res.data.cars[0].carSeriesName || res.data.cars[0].carImportName || '未知车系';
      self.setData({
        owner_car: carSeriesName
      })
      wx.hideLoading()
    })
  },
  //提交数据
  submitForm(e) {
    var self = this;
    var name = e.detail.value.name;
    var phone = e.detail.value.phone;
    var mileage = e.detail.value.mileage;

    if (!this.data.isCar) {
      utils.toast('请选择换车车型')
    } else if (!this.data.isDate) {
      utils.toast('请选择上牌时间')
    } else if (!mileage) {
      utils.toast('请填写行驶里程')
    } else if (!name) {
      utils.toast('请填写姓名')
    } else if (!phone) {
      utils.toast('请填写联系方式')
    } else if (!utils.isMobile(phone)) {
      utils.toast('手机号码格式错误')
    } else {
      self.setData({ isSubmit:true})
      Api.authPost('/owner/add-car-exchange',{
        name: name,
        phone: phone,
        owner_car: self.data.owner_car,
        love_car: self.data.modelname,
        love_car_id: self.data.modelid,
        distance: mileage,
        shangpai: Date.parse(self.data.date)*0.001,
      },function(res){
        var res = res.data;
        wx.showModal({
          content: '我们已经收到您的置换请求，销售顾问会尽快联系您，请耐心等待',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })
        
      })
    }
  },
  bindDateChange (e){
    this.setData({
      date: e.detail.value,
      dateTips: e.detail.value,
      isDate:true,
    })
  },
  //限制日期选择
  limitDate() {
    var date = new Date();

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    this.setData({
      nowDate: [year, month, day].join('-')
    })
    
  },
  navigateTo(e){
    utils.href(e)
  },
  // onShareAppMessage: function () {
  //   return {
  //     path: '/pages/keep/second_handcarexchange/second_handcarexchange',
  //     success: function (res) {
  //       // 转发成功

  //     },
  //     fail: function (res) {

  //     }
  //   }
  // }
 
  
})
