var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";

var app = getApp()
Page({
  data: {
    showCode:false,
    couponStatus:0,
    carname: '请选择爱车型号',
    modelname: '请选择爱车型号',
    carOrigin: {
      manufactureid: '',
      modelid: '',
      modelname: '选择在用车辆',
      isCar: false,
    },
    carInfo: {
      brand_id: '',
      brand_name: '',
      car_id: '',
      car_name: '选择意向车型',
      factory_price: '',
      model_id: '',
      model_logo: '',
      model_name: '',
      shop_price: ''
    },
    id: '',
    showForm: [],
    showPage: false,
    carNumChange: '',
    proData: ['京', '津', '渝', '沪', '冀', '晋', '辽', '吉', '黑', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '琼', '川', '贵', '云', '陕', '甘', '青', '桂', '蒙', '宁', '新', '藏', '港', '澳', '台',],
    proText: '京',
    user_info: {},
    apply_remark: ''
  },
  onLoad (options){
    this.setData({
      id: options.id
    })
    wx.setNavigationBarTitle({
      title: this.options.id == 0 ? '通用申请': '申请优惠券',
    })
    app.viewRecord();//活跃度统计
    var self = this;
    wx.showLoading({
      title: '加载中...',
    })
    app.getSystemInfo((res) => {
      console.log(res.windowHeight)
      
      self.setData({
        windowHeight: res.windowHeight - res.windowWidth / 750 * 102
      })
    })
    this.searchCanReceiveData();
    
  },
  searchCanReceiveData(){
    var self=this;
    wx.showLoading({
      title: '加载中...',
    })
    Api.authPost('/coupon/apply/index', {id: this.options.id}, function (res) {
      wx.hideLoading();
      if(res.code == 200){
        let form = {}
        let proText = res.data.car_num_prefix.substr(0,1);
        let carNumChange = res.data.car_num_prefix.substr(1,);
        res.data.user_info.forEach(element => {
          form[element] = true;
          if(element == 'car_num' && res.data.default_value[element]){
            proText = res.data.default_value[element].substr(0,1);
            carNumChange = res.data.default_value[element].substr(1,);
          }
          else if(element == 'name' || element == 'phone' && res.data.default_value[element]){
            console.log(self.data.user_info)
            console.log(self.data.user_info[element], res.data.default_value[element])
            self.data.user_info[element] = res.data.default_value[element];
            
          } else if (element == 'car_after' && res.data.default_value[element] && res.data.default_value[element].model_name){
            self.data.user_info[element] = res.data.default_value[element].model_name;
            // self.data.carOrigin.modelid = res.data.default_value[element].model;
            // console.log(self.data.carOrigin.modelid)
            let modelid = 'carOrigin.modelid';
            let modelname = 'carOrigin.modelname';
            self.setData({
              [modelid]: res.data.default_value[element].model,
              [modelname]: res.data.default_value[element].model_name
            })
          } else if (element == 'car_sell' && res.data.default_value[element] && res.data.default_value[element].car_name) {
            self.data.user_info[element] = res.data.default_value[element].car_name;
            // self.data.carInfo.car_id = res.data.default_value[element].car;
            // console.log(self.data.carInfo.car_id)
            let car_id = 'carInfo.car_id';
            let car_name = 'carInfo.car_name';
            self.setData({
              [car_id]: res.data.default_value[element].car,
              [car_name]: res.data.default_value[element].car_name
            })
          } else{
            self.data.user_info[element] = ''
          }
        });
        console.log(self.data.user_info)
        console.log(self.data.carOrigin)
        console.log(self.data.carInfo)
        self.setData({
          proText: proText,
          carNumChange: carNumChange,
          user_info: self.data.user_info,
          showForm: form,
          couponStatus: 3,
          showPage: true,
        })
        // this.car_num_prefix = res.data.car_num_prefix;
        /* res.data.user_info.forEach(element => {
          console.log(element)
          // this.user_info[element] = '';
          this.$set(this.user_info, element, '')
        }); */
      }else{
        utils.toast(res.msg)
      }
      

    })
  },
  //选择汽车型号
  selectCar() {
    wx.navigateTo({
      url: '../select_car/select_car?type=origin'
    })
  },
  selectCarModel() {
    wx.navigateTo({
      url: '../../buy/select_car_model/select_car_model'
    })
  },

  //显示隐藏selectWrap
  selectPro() {
    var showProSelect = this.data.showProSelect;
    this.setData({
      showProSelect: !showProSelect
    })
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
  bindTextAreaBlur(e) {
    this.setData({
      apply_remark: e.detail.value
    })
  },
  //提交数据
  submitForm(e) {
    var self = this;
    console.log(e.detail.value,  self.data)
    var name = e.detail.value.name;
    var phone = e.detail.value.phone;
    var carNum = e.detail.value.carNum;
    var car_after = self.data.carOrigin.modelid;
    var car_sell = self.data.carInfo.car_id;

    var isNeedCheckCar = false;
    var checkCarinfo = '';
    console.log(self.data.proText + carNum)
    //验证数据
    if (self.data.showForm.car_num && !carNum) {
      utils.toast('请填写车牌')
      return
    } else if (self.data.showForm.car_num && !utils.isVehicleNumber(self.data.proText + carNum)) {
      utils.toast('车牌格式错误')
      return
    }

    if (self.data.showForm.name && !name) {
      utils.toast('请填写姓名')
    } else if (self.data.showForm.phone && !phone) {
      utils.toast('请填写电话')
    } else if (self.data.showForm.phone && !utils.isMobile(phone)) {
      utils.toast('电话号码格式错误')
    } else if (self.data.showForm.car_after && !car_after) {
      utils.toast('请填写在用车辆')
    } else if (self.data.showForm.car_sell && !car_sell) {
      utils.toast('请填写意向车型')
    } else {
      self.setData({ isSubmit: false })
      // var formData = {
      //   carId: this.data.manufactureid,
      //   cpNum: this.data.modelid,
      //   name: name,
      //   tel: phone,
      // }
      var formData = {
        id: self.data.id,
        name: name,
        phone: phone,
        car_num: self.data.proText + carNum,
        car_after: car_after,
        car_sell: car_sell,
        apply_remark: self.data.apply_remark
      }
      if (self.data.selectTabCar) {
        formData.cpNum = self.data.proText + carNum
      }
      wx.showLoading({
        title: '加载中...',
      })
      console.log(JSON.stringify(formData));
      Api.authPost('/coupon/apply/add', formData, function (res) {
        if (res.code == 200) {
          if(res.data.apply_id && res.data.apply_id != 0){
            let urlParam = JSON.stringify(res.data.apply_id)
            wx.navigateTo({ url: `/pages/user/get_card/get_card?apply_id=${urlParam}`})
          }else{
            wx.showToast({
              title: '添加成功！',
              mask: true,
            })
          }
        } else {
          utils.toast(res.msg)
        }

      })
    }
  },
  
})
