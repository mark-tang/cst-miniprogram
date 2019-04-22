//index.js
var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
var app = getApp()
//获取应用实例
var app = getApp()
Page({
  data: {
    dateTips: '请选择出生日期',
    date: '',
    isCar: false,
    isDate: false,
    modelname: '请选择车型',
    modelid: '',
    manufactureid: '',
    showPage: false,
    coding: false,
    codingVoice: false,
    codingVoiceText:false,
    codeTime: 60,
    userInfo: {},
  },
  onLoad() {
    app.viewRecord();//活跃度统计
    this.limitDate()
    wx.showLoading({
      title: '加载中',
    })
    this.getUserInfo()
  },
  inputEvent(e) {
    let phone = e.detail.value;
    let userInfo = this.data.userInfo;
    userInfo.u_phone = phone;
    this.setData({
      userInfo: userInfo,
    })
  },
  //获取短信验证码
  getCode(e) {
    let self = this;
    let sendtype = e.currentTarget.dataset.sendtype;
    let sms_type = sendtype == 1 ? 'sms' : 'voice';
    wx.showLoading()
    Api.authPost('/customer/send-sms', {
      phone: this.data.userInfo.u_phone,
      sms_type: sms_type,
    }, function (res) {
      wx.hideLoading()
      if (res.code == 200) {
        if (sendtype == 1) {
          self.runCode();
        } else {
          self.runVoiceCode();
        }
      }
    })
  },
  runCode() {
    let self = this;
    let codeTime = this.data.codeTime;
    self.setData({
      coding: true,
      codingVoice: true
    })
    let timer = setInterval(() => {
      codeTime--
      self.setData({
        codeTime: codeTime
      })
      if (codeTime <= 0) {
        clearInterval(timer)
        self.setData({
          coding: false,
          codeTime: 60
        })
      }
    }, 1000)
  },
  runVoiceCode(){
    let self = this;
    let codeTime = this.data.codeTime;
    self.setData({
      codingVoiceText: true,
      codingVoice: false
    })
    let timer = setInterval(() => {
      codeTime--
      self.setData({
        codeTime: codeTime
      })
      if (codeTime <= 0) {
        clearInterval(timer)
        self.setData({
          codingVoiceText: false,
          codingVoice:true,
          codeTime: 60
        })
      }
    }, 1000)
  },
  getUserInfo() {
    let self = this;
    Api.authPost('/owner/getinfo', {}, function (res) {
      // if (res.data.u_car_model_id) {
      //   self.setData({
      //     userInfo: res.data,
      //     modelid: res.data.u_car_model_id,
      //     modelname: res.data.u_car_model_name,
      //     manufactureid: res.data.u_car_brand_id, 
      //     showPage: true,
      //   })
      // } else {
      //   self.setData({
      //     userInfo: res.data,
      //     showPage: true,
      //   })
      // }
      if (res.data.archive){
        var userInfo = {
          u_name: res.data.archive.name,
          u_phone: res.data.archive.tel          
        }
        var manufactureid='';
        let modelid='';
        var modelname='';
        var data = res.data.archive.birthday ?res.data.archive.birthday:'请选择出生日期';    
        var isDate=false;
        if (data) { isDate=true}    
        if(res.data.cars.length>0){
          manufactureid = res.data.cars[0].carBrandId;          
          modelname = res.data.cars[0].carSeriesName || res.data.cars[0].carImportName || '';
          userInfo.u_chepai = res.data.cars[0].lpn;       
          if (modelname){
            modelid = res.data.cars[0].carId;
          }else{
            modelid ='';
          }
        }
        console.log(modelid) 
        self.setData({
          userInfo: userInfo,
          manufactureid: manufactureid,
          modelname: modelname,
          modelid: modelid,
          data: data,
          dateTips: data,
          isDate: isDate,
          showPage: true,
        })
        console.log(self.data.modelid)
      }
     

    })
  },
  //提交数据
  submitForm(e) {
    let self = this;
    let name = e.detail.value.name;
    let phone = e.detail.value.phone;
    let code = e.detail.value.code;
    let brandId = this.data.manufactureid;
    let modelId = this.data.modelid;
    let plateNumber = e.detail.value.plateNumber;
    let birthday = this.data.date;
    console.log(modelId)
    let nowTime = new Date().getTime();
    let birthdayTime = new Date(birthday).getTime();
    if (!name) {
      utils.toast('请填写姓名')
    } else if (!phone) {
      utils.toast('请填写联系方式')
    } else if (!Api.Utils.isMobile(phone)) {
      utils.toast('联系方式错误')
    } else if (!code) {
      utils.toast('请填写验证码')
    } else if (!modelId) {
      utils.toast('请选择车型')
    } else if (!plateNumber) {
      utils.toast('请填写车牌')
    } else if (!Api.Utils.isVehicleNumber(plateNumber)) {
      utils.toast('车牌信息错误')
    } else if (!this.data.isDate) {
      utils.toast('请选择出生日期')
    } else if ((nowTime - birthdayTime) < (18 * 31536000000)) {
      utils.toast('出生日期不合法')
    } else {
      self.setData({ isSubmit: true })
      Api.authPost('/member/create', {
        name: name,
        phone: phone,
        birthday: birthday,
        captcha: code,
        plateNumber: plateNumber,
        brandId: brandId,
        modelId: modelId,
      }, function (res) {
        var res = res.data;
        wx.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 1500
        })
        setTimeout(() => {
          wx.redirectTo({
            url: '../member/member'
          })
        }, 1500)

      })
    }
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value,
      dateTips: e.detail.value,
      isDate: true,
    })
  },
  //限制日期选择
  limitDate() {
    var date = new Date();

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    console.log([year, month, day].join('-'))
    this.setData({
      nowDate: [year, month, day].join('-')
    })

  },
  navigateTo(e) {
    utils.href(e)
  },
})
