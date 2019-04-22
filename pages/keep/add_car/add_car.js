//index.js
var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";

//获取应用实例
var app = getApp()
Page({
  data: {
    isCar: false,
    isAdvisor: false,
    isCarNum: false,
    isName: false,
    isMoblie: false,
    btnDisabled: true,
    showSelectTab: false,
    selectTabCar: true,
    advisorInfo: [],
    manufactureid: '',
    modelname: '请选择爱车型号',
    modelid: '',
    addType: 1,
    showPage: false,
    carNumChange: '',
    proData: ['京', '津', '渝', '沪', '冀', '晋', '辽', '吉', '黑', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '琼', '川', '贵', '云', '陕', '甘', '青', '桂', '蒙', '宁', '新', '藏', '港', '澳', '台',],
    proText: '京',
    showProSelect: false,
    configIndex: 0,
    uName: '',
    uPhone: '',
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    //获取顾问信息
    var self = this;
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      host: Api.config.host,
    })
    self.queryData(options)
  },
  //加载初始信息
  queryData(options) {
    var that = this;
    Api.authPost('/owner/getinfo', {}, function (res) {
      var cp_prefix = '';
      var carSeriesName='';
      var modelid='';
      var isCar=false;
      res.data.archive = res.data.archive ? res.data.archive:{};
     
      if(res.data.cars.length==0){
        cp_prefix = res.data.archive.cp_prefix ? res.data.archive.cp_prefix:'';
      }else{
        console.log(res.data.cars[0].carImportName)
        cp_prefix = res.data.cars[0].lpn ? res.data.cars[0].lpn:'';
        modelid = res.data.cars[0].carId;
        carSeriesName = res.data.cars[0].carSeriesName || res.data.cars[0].carImportName || '';
        if (carSeriesName){
          isCar = true;
        }else{
          isCar = false;
        }        
      }
      cp_prefix=cp_prefix?cp_prefix : res.data.area.cp_prefix;
      var name = res.data.archive.name;
      var tel = res.data.archive.tel;
      var proText = cp_prefix.substr(0,1);
      var carNumChange = cp_prefix.substr(1,);
      that.setData({
        proText: proText,
        carNumChange: carNumChange,
        uName: name,
        uPhone:tel,
        modelid: modelid,
        modelname: carSeriesName,
        isCar: isCar,
        showPage: true,
      })
      wx.hideLoading()
    })
    if (options.type == 'add') {
      wx.setNavigationBarTitle({
        title: '添加我的爱车'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '完善资料'
      })
    }
    // var self = this;
    // if (options.type == 'add'){
    //   wx.setNavigationBarTitle({
    //     title: '添加我的爱车'
    //   })
    //   var proText = ''
    //   var carNumChange = ''
    //   Api.authPost('/owner/getinfo', {}, function (res) {
    //     if (res.data.cp_prefix){
    //       var chepai = res.data.cp_prefix;
    //       var proText = chepai.slice(0, 1);
    //       var carNumChange = chepai.slice(1, chepai.length);
    //       self.setData({
    //         proText: proText,
    //         carNumChange: carNumChange,
    //         showPage: true,
    //       })
    //       wx.hideLoading()
    //     }
    //   })
    // } else if (options.type == 'supply'){
    //   wx.setNavigationBarTitle({
    //     title: '完善资料'
    //   })
    //   Api.authPost('/owner/getinfo',{},function(res){
    //     if (res.data.u_addtype == 1){
    //       var proText = '' 
    //       var carNumChange = ''         
    //       if (res.data.u_chepai){
    //         var chepai = res.data.u_chepai;
    //         var proText = chepai.slice(0, 1);
    //         var carNumChange = chepai.slice(1, chepai.length);
    //       }else{
    //         var chepai = res.data.cp_prefix;
    //         var proText = chepai.slice(0, 1);
    //         var carNumChange = chepai.slice(1, chepai.length);
    //       }
    //       console.log(proText)
    //       self.setData({
    //         proText: proText,
    //         carNumChange: carNumChange,
    //         addType: 1,
    //       })
    //     } else if (res.data.u_addtype == 2){
    //       self.setData({
    //         selectTabCar: false,
    //         VinNumChange: res.data.u_vin,
    //         addType:2,
    //       })
    //     }
    //     //init顾问
    //     if (res.data.u_sa_id){
    //       var advisorInfo = self.data.advisorInfo;
    //       var activeId = res.data.u_sa_id;
    //       for (var i in advisorInfo) {
    //         if (advisorInfo[i].accountId == activeId) {
    //           advisorInfo[i].isActive = true;
    //         }
    //       }
    //       self.setData({
    //         isAdvisor: true, 
    //         advisorInfo: advisorInfo, 
    //         selectAdvisorId: res.data.u_sa_id,
    //       })
    //     }
    //     //init爱车信息
    //     if (
    //       res.data.u_car_model_name && 
    //       res.data.u_car_model_id &&
    //       res.data.u_car_brand_id
    //       ){
    //       self.setData({
    //         modelname: res.data.u_car_model_name,
    //         manufactureid: res.data.u_car_brand_id,
    //         modelid: res.data.u_car_model_id,
    //         isCar: true,
    //       })
    //     }
    //     self.setData({
    //       uName:res.data.u_name,
    //       uPhone:res.data.u_phone,
    //       showPage: true,
    //     })
    //     wx.hideLoading()
    //   })
    // }
  },
  //显示隐藏提示图片
  showImage() {
    var showFrameImage = this.data.showFrameImage
    this.setData({ showFrameImage: !showFrameImage });
  },
  //提交数据
  submitForm(e) {
    var self = this;
    var carNum = e.detail.value.carNum;
    var vinNum = e.detail.value.vinNum;
    var name = e.detail.value.name;
    var phone = e.detail.value.phone;

    var isNeedCheckCar = false;
    var checkCarinfo = '';
    //验证数据
    if (!this.data.isCar) {
      utils.toast('请选择车型')
      return
    }
    if (self.data.selectTabCar) {
      if (!carNum) {
        utils.toast('请填写车牌')
        return
      } else if (!utils.isVehicleNumber(self.data.proText + carNum)) {
        utils.toast('车牌格式错误')
        return
      }
    } else {
      if (!vinNum) {
        utils.toast('请填写车架号')
        return
      }
    }
    if (!name) {
      utils.toast('请填写姓名')
    } else if (!phone) {
      utils.toast('请填写手机号码')
    } else if (!utils.isMobile(phone)) {
      utils.toast('手机号码格式错误')
    } else {
      self.setData({ isSubmit: false })
      // var formData = {
      //   carId: this.data.manufactureid,
      //   cpNum: this.data.modelid,
      //   name: name,
      //   tel: phone,
      // }
      var formData = {
        carId: this.data.modelid,
        name: name,
        tel: phone,
        from:2
      }
      if (self.data.selectTabCar) {
        formData.cpNum = self.data.proText + carNum
      }
      wx.showLoading({
        title: '加载中...',
      })
      console.log(JSON.stringify(formData));
      Api.authPost('/owner/create-owner', formData, function (res) {
        if (res.code == 200) {
          wx.showToast({
            title: '添加成功！',
            mask: true,
          })
          wx.setStorage({
            key: 'isReload',
            data: 'true',
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        } else {
          utils.toast(res.msg)
        }

      })
    }
  },
  //车牌输入控制
  inputCarNum(e) {
    var self = this;
    var carNum = e.detail.value.toUpperCase()
    if (!e.detail.value) {
      self.setData({
        carNumChange: ''
      })
    }
    //匹配中文的正则
    var exp = /[^\u4e00-\u9fa5]/;
    if (exp.test(carNum)) {
      //字母转换大写
      self.setData({
        carNumChange: carNum
      })
    } else {
      return
    }
  },
  //车架号输入控制
  inputVinNum(e) {
    var self = this;
    var carNum = e.detail.value.toUpperCase()
    if (!e.detail.value) {
      self.setData({
        carNumChange: ''
      })
    }
    //匹配中文的正则
    var exp = /[^\u4e00-\u9fa5]/;
    if (exp.test(carNum)) {
      //字母转换大写
      self.setData({
        VinNumChange: carNum
      })
    } else {
      return
    }
  },
  //车牌地tap
  changePro(e) {
    var proText = e.currentTarget.dataset.item
    var index = e.currentTarget.dataset.index
    this.setData({
      proText: proText,
      configIndex: index,
      showProSelect: false,
    })
    //this.isVinOrCode()
  },
  //显示隐藏selectWrap
  selectPro() {
    var showProSelect = this.data.showProSelect;
    this.setData({
      showProSelect: !showProSelect
    })
  },
  //选择汽车型号
  selectCar() {
    wx.navigateTo({
      url: '../select_car/select_car'
    })
  },
  //选择车架号或车牌号
  changeTab(e) {
    var id = e.target.id;
    var selectTabCar = true;
    var addType = 1;
    if (id == 0) {
      selectTabCar = true;
      addType = 1;
    } else if (id == 1) {
      selectTabCar = false;
      addType = 2;
    }
    this.setData({
      selectTabCar: selectTabCar,
      showSelectTab: false,
      addType: addType,
    })
  },
  //显示Tab
  selectCarTab() {
    this.setData({
      showSelectTab: true,
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
  //是否填写姓名                                                                                   
  inputName(e) {
    if (e.detail.value) {
      this.setData({ isName: true })
    } else {
      this.setData({ isName: false })
    }
  },
  //是否填写联系方式
  inputMoblie(e) {
    if (e.detail.value) {
      this.setData({ isMoblie: true })
    } else {
      this.setData({ isMoblie: false })
    }
  },
})
