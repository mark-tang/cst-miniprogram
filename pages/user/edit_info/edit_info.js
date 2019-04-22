//index.js
var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js"

//获取应用实例
var app = getApp()
Page({
  data: {
    showFrameImage: false,
    carOrigin: {
      manufactureid: '',
      modelid: '',
      modelname: '请选择已有车型',
      isCar: false,
    },
    cardDate: '请选择',
    isCardDate: false,
    licenseDate: '请选择',
    xubaoDate: '请选择',
    isLicenseDate: false,
    licenseType: ['A', 'B', 'C'],
    licenseTypeIndex: 0,
    carArray:[],
    carIndex:0
  },
  onLoad() {
    app.viewRecord();//活跃度统计
    wx.showLoading({ title: '加载中...' })
    this.setData({
      host: Api.config.host,
    })
    var self = this;
    // Api.authGet('/common/advisor-list', {
    //   type: 1,
    //   random: 1
    // }, function (res) {
    //   wx.showLoading({ title: '加载中...' })
    //   var advisorInfo = res.data;
    //   for (var i in advisorInfo) {
    //     advisorInfo[i].isActive = false;
    //   }

    //   self.setData({
    //     advisorInfo: advisorInfo,
    //   })
    // });
    this.queryData()
    this.limitDate()

  },
  //限制日期选择
  limitDate() {
    var date = new Date();

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    this.setData({
      nowDate: [year-18, month, day].join('-')
    })
  },
  //queryData
  queryData() {

    var self = this;
    // Api.authGet('/owner/get-my-car', {}, function (res) {
    //   alert(3)
    //   wx.hideLoading()
    // })
    Api.authGet('/owner/getinfo', {}, function (res) {
      let Lpns = [];
      let cars = res.data.cars;
      let useCarId=res.data.archive.useCarId
      let carIndex=0;
      for (let i = 0; i < cars.length; i++) {
        let carSeriesName = cars[i].carSeriesName || cars[i].carImportName || '未知车系';
        Lpns.push({ id: cars[i].carId, lpn: cars[i].lpn, carSeriesName: carSeriesName})
        if (useCarId == cars[i].carId){
          carIndex=i;
        }
      }
      let json = { modelname: res.data.cars[0].carSeriesName, modelid: res.data.cars[0].carId }
      self.setData({
        base: res.data,
        carOrigin: json,
        Lpns: Lpns,
        carIndex: carIndex,
        licenseDate: res.data.archive.birthday
      })


      // res.data.u_driver_license_type ? res.data.u_driver_license_type : res.data.u_driver_license_type = 1;
      // var carOrigin = {
      //   manufactureid: res.data.u_car_brand_id,
      //   modelid: res.data.u_car_model_id,
      //   modelname: res.data.u_car_model_name,
      //   isCar: true,
      // }
      // var licenseValue = []
      // var licenseType = res.data.license_type
      // for (var i in licenseType){
      //   licenseValue.push(licenseType[i])
      // }
      // //init顾问
      // if (res.data.u_sa_id) {
      //   var advisorInfo = self.data.advisorInfo;
      //   var activeId = res.data.u_sa_id;
      //   for (var i in advisorInfo) {
      //     if (advisorInfo[i].accountId == activeId) {
      //       advisorInfo[i].isActive = true;
      //     }
      //   }
      //   self.setData({
      //     isAdvisor: true,
      //     advisorInfo: advisorInfo,
      //     selectAdvisorId: res.data.u_sa_id,
      //   })
      // }
      // if (res.data.u_buy_car_time){
      //   self.setData({
      //     cardDate: res.data.u_buy_car_time,
      //     isCardDate: true,
      //   })
      // }
      // if (res.data.u_get_license_time) {
      //   self.setData({
      //     licenseDate: res.data.u_get_license_time,
      //     isLicenseDate: true,
      //   })
      // }
      // if (res.data.u_last_safe_time) {
      //   self.setData({
      //     xubaoDate: res.data.u_last_safe_time,
      //     isXubaoDate: true,
      //   })
      // }

      // self.setData({
      //   base:res.data,
      //   carOrigin:carOrigin,      
      //   licenseValue: licenseValue,
      //   licenseTypeIndex: Number(res.data.u_driver_license_type) -1,
      //   insuranceDate: res.data.u_last_safe_time,
      //   showPage:true,
      // })
      wx.hideLoading()
    })
  },
  //选择当前车辆
  bindCarChange:function(e){
    this.setData({
      carIndex: e.detail.value
    })
  },
  //选择售后顾问
  selectAdvisor: function (e) {
    var index = e.currentTarget.id;
    var thisData = this.data.advisorInfo;

    for (var key in thisData) {
      thisData[key].isActive = false;
    }

    thisData[index].isActive = true;
    this.setData({
      advisorInfo: thisData,
      isAdvisor: true,
      selectAdvisorId: thisData[index].accountId
    })

  },
  //显示隐藏提示图片
  showImage() {
    var showFrameImage = this.data.showFrameImage
    this.setData({ showFrameImage: !showFrameImage });
  },
  //选择已有车型
  tapCarOrigin() {
    wx.navigateTo({
      url: '../select_car/select_car?type=origin'
    })
  },
  //上牌时间
  getCardDate(e) {
    this.setData({
      cardDate: e.detail.value,
      isCardDate: true,
    })
  },
  //领证时间
  getLicenseDate(e) {
    this.setData({
      licenseDate: e.detail.value,
      isLicenseDate: true,
    })
  },
  //续保时间
  getXubaoDate(e) {
    this.setData({
      xubaoDate: e.detail.value,
      isXubaoDate: true,
    })
  },
  //驾照类型
  bindLicense(e) {
    this.setData({
      licenseTypeIndex: e.detail.value
    })
  },
  bindKeyInput: function (e) {
    var idx=e.currentTarget.dataset.idx;
    var Lpns=this.data.Lpns;
    Lpns[idx].lpn = e.detail.value;
    this.setData({
      Lpns: Lpns
    })
  },
  //提交数据
  submitForm(e) {
    console.log(e)
    var parma={};
    var self = this
    parma.name = e.detail.value.name;
    parma.phone = e.detail.value.phone;
    parma.sex = e.detail.value.sex;
    parma.birthday = e.detail.value.birthday;

    // var carNum = e.detail.value.carNum;
    // var VinNum = e.detail.value.VinNum;
    // var engineNum = e.detail.value.engineNum;
    // var car_brand_id = this.data.carOrigin.manufactureid;
    let index = this.data.carIndex;
    parma.car_id = this.data.Lpns[index].id;
    // var driver_license_type = Number(this.data.licenseTypeIndex) + 1;
    // var buy_car_time = this.data.cardDate;
    // var isCard = this.data.isCardDate;
    // var license_time = this.data.licenseDate;
    // var isLicense = this.data.isLicenseDate;
    // var isXubaoDate = this.data.isXubaoDate;
    // var safe_time = this.data.xubaoDate;
    // var licenseType = Number(this.data.licenseTypeIndex) +1
    // parma.lpns = [].concat(this.data.Lpns);
    // for(var j=0;j<parma.lpns.length;j++){
     
    //   var lpn = parma.lpns[j].lpn;
    //   if (utils.isVehicleNumber(lpn)){
    //     utils.toast('车牌格式错误');
    //     return;
    //   }
    // }
    // parma.lpns = new Array(JSON.stringify(parma.lpns));
    // console.log(Object.prototype.toString.call(parma.lpns))
    // console.log(parma.lpns);
    
    if (!parma.name) {
      utils.toast('请填写姓名')
      return
    } if (!parma.sex) {
      utils.toast('请填写性别')
      return
    } 
    // if (!parma.birthday) {
    //   utils.toast('选择日期')
    //   return
    // } 
    else if (!parma.phone) {
      utils.toast('请填写手机号码')
      return
    } else if (!utils.isMobile(parma.phone)) {
      utils.toast('手机号码格式错误')
      
      return
    }
    // if (VinNum) {
    //   if (VinNum.length < 6) {
    //     utils.toast('车架号有误')
    //     return
    //   }
    // }
    // if (engineNum) {
    //   if (engineNum.length < 6) {
    //     utils.toast('发动机号有误')
    //     return
    //   }
    // }
    // if (!isCard) {
    //   utils.toast('请选择上牌时间')
    // } else if (!isLicense) {
    //   utils.toast('请选择领证时间')
    // } else if (!isXubaoDate) {
    //   utils.toast('请选择续保时间')
    // } 
    else {
      let lpns = this.data.Lpns;
      for (var i = 0; i < lpns.length; i++) {
        parma["lpns[" + i + "][id]"] = lpns[i].id;
        parma["lpns[" + i + "][lpn]"] = lpns[i].lpn;
        if (!utils.isVehicleNumber(lpns[i].lpn)) {
          utils.toast('车牌格式错误')
          return
        }
      }  
      self.setData({ isSubmit: true })
      wx.setStorage({
        key: 'isReload',
        data: 'true',
      })
      // parma = JSON.stringify(parma)
      
     
      Api.authPost('/owner/update-owner', parma, function (res) {
        if (res.data.code = 200) {
          wx.showToast({
            title: '提交成功！',
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }

      })


    }
  }

})
