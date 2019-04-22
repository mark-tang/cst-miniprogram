//index.js
var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";

//获取应用实例
var app = getApp()
Page({
  data: {
    items: [
      { name: 'jiaoqiang', value: '交强险', checked: true},
      { name: 'san', value: '第三者责任险', checked: true },
      { name: 'chengyuan', value: '车上人员责任险', checked: true},
      { name: 'chesun', value: '车辆损失险', checked: true},
      { name: 'daoqiang', value: '盗抢险', checked: true},
      { name: 'boli', value: '玻璃单独破碎险', checked: true },
      { name: 'buji', value: '不计免赔特约险', checked: true },
      { name: 'ziran', value: '自燃险', checked: false },
      { name: 'xinzengshebei', value: '新增设备损失险', checked: false },
      { name: 'jingshen', value: '精神损害赔偿险', checked: false },
      { name: 'huahen', value: '车身划痕险', checked: false },
      { name: 'fadongji', value: '发动机涉水险', checked: false },
      { name: 'travel_tax', value: '车船使用税', checked: true }, 
    ],
    insuranceValue:[
      {value: 5, name: '5万' },
      {value: 10, name: '10万' },
      {value: 20, name: '20万' },
      {value: 30, name: '30万' },
      {value: 50, name: '50万' },
      {value: 100, name: '100万' },
    ], 
    insuranceInputValue:30,
    chenyuanNumValue: [
      { value: 1, name: '1人' },
      { value: 2, name: '2人' },
      { value: 3, name: '3人' },
      { value: 4, name: '4人' },
      { value: 5, name: '5人' },
      { value: 6, name: '6人' },
      { value: 7, name: '7人' },
    ],
    chenyuanNumInputValue: 1,
    insuranceInputShow:true,
    chenyuanNumShow:true,
    showMore:false,
    dateTips: '请选择',
    date: '',
    isCheck:false,
    isDate: false,
    isChosed:false,
    chosedAdvisor:'请选择',
    advisorId:'',
    carList:[],
    carIndex:0,
    checkboxGroup: { 
      jiaoqiang: 1, 
      san: 1, 
      chengyuan: 1, 
      chesun: 1, 
      daoqiang: 1, 
      boli: 1,
      buji: 1,
      travel_tax:1,
    },
  },
  onLoad() {
    app.viewRecord();//活跃度统计
    this.getUserInfo()
    this.isCheckbox()
    this.limitDate()
    let date = new Date();
    let currentDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    console.log(currentDate)
    this.setData({
      currentDate: currentDate
    })
    Api.authPost('/data/maidian', { type: 14 }, function (res) { })
  },
  //获取车主资料
  getUserInfo(){
    wx.showLoading({
      title: '加载中...',
    })
    var self = this;
    wx.getStorage({
      key: 'session_key',
      success(res) {
        self.setData({
          token: res.data
        })
      }
    })
    Api.authGet('/owner/getinfo',{},function(res){
      //res.data.u_buy_car_time ? '' : res.data.u_buy_car_time='2017-01-01'
      let useCarId=res.data.archive.useCarId;//当前用车ID
      let chepai="";//车牌
      let carIndex=0;//选中车下标
      let insuranceExpiredDate;//到期日期
      for (let i = 0; i < res.data.cars.length;i++){
        if (useCarId == res.data.cars[i].carId){
          carIndex=i;
          chepai = res.data.cars[i].lpn;
          insuranceExpiredDate = res.data.cars[i].insuranceExpiredDate; 
        }
      }
      for (var i = 0; i < res.data.cars.length;i++){
        res.data.cars[i].carSeriesName = res.data.cars[i].carSeriesName || res.data.cars[i].carImportName || '未知车系'
      }
      self.setData({
        userName: res.data.archive.name,
        userPhone: res.data.archive.tel,
        carList: res.data.cars,
        chepai: chepai,
        carIndex: carIndex,
        carId: useCarId,
        showPage:true,
        date: insuranceExpiredDate,
        curDate: insuranceExpiredDate
      });
      if (!insuranceExpiredDate){
        self.setData({
          date: '',
          dateTips: '请选择',
          isDate:false
        })
      }else{
        self.setData({
          date: insuranceExpiredDate,
          curDate: insuranceExpiredDate,
          dateTips: insuranceExpiredDate,
          isDate: true,
        })
      }
      // if (res.data.u_xb_id != 0){
      //   self.setData({
      //     chosedAdvisor: res.data.u_xb_name,
      //     advisorId: res.data.u_xb_id,
      //   })
      // }
    })
  },
  //提交表单
  submitForm(e) {
    var self = this;
    var name = e.detail.value.name;
    var phone = e.detail.value.phone;
    var carNum = this.data.chepai;
    var chengyuanNum = e.detail.value.num;
    if (self.data.insuranceInputShow){
      if (!self.data.insuranceInputValue){
        utils.toast('请选择保险金额')
        return
      }
    }
    if (!this.data.isCheck) {
      utils.toast('请选择至少一个险种')
    } else if (!name) {
      utils.toast('请填写姓名')
    } else if (!phone) {
      utils.toast('请填写电话')
    } else if (!utils.isMobile(phone)) {
      utils.toast('电话填写错误')
    } else if (!utils.isVehicleNumber(carNum)) {
      utils.toast('车牌填写错误')
    } else if (!carNum) {
      utils.toast('请填写车牌')
    } else if (!this.data.isDate) {
      utils.toast('请选择保险到期日期')
    } else {
      self.setData({ isSubmit: true })
      var formData = {
        contacts: name,
        user_phone: phone,
        chepai_num: carNum,
        travel_img: this.data.path, 
        // buy_car_date: this.data.date,
        insurance_expired_at: this.data.date,
        car_id: this.data.carId,
        wechat:1,
        from: 2,  // [微信公众号, 小程序， h5] => [1, 2, 3]
        formId: e.detail.formId,  // 模板消息
        t: 'whatever'
      };
      if (self.data.insuranceInputShow) {
        formData.san_jian = self.data.insuranceInputValue;
      }
      if (self.data.chenyuanNumShow) {
        formData.chengyuan_num = self.data.chenyuanNumInputValue;
      }
      var formData = Object.assign(formData, this.data.checkboxGroup)
      wx.showLoading({
        title: '加载中...',
      })
      Api.authPost('/renewal/enquiry', formData , function (res) {
        var res = res.data
        wx.hideLoading();
        wx.showModal({
          content: '您提交的续保询价我们已经收到，我们将为您核算出最优惠价格，24小时内给您回复，感谢您的关注与厚爱！',
          showCancel: false,
          success: function (cres) {
            if (cres.confirm) {
              wx.navigateBack({
                delta: 1
              })
            }
          }
        })

      })

    }
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value,
      dateTips: e.detail.value,
      isDate:true,
    })
  },
  //选择车
  bindCarChange(e){
   
    let carList=this.data.carList;
    console.log(carList)
    console.log(carList[e.detail.value].insuranceExpiredDate)
    let isDate = carList[e.detail.value].insuranceExpiredDate == '' ? false : true;
    this.setData({
      carIndex: e.detail.value,
      chepai: carList[e.detail.value].lpn,
      carId: carList[e.detail.value].carId,
      date: carList[e.detail.value].insuranceExpiredDate,
      curDate: insuranceExpiredDate,
      dateTips: carList[e.detail.value].insuranceExpiredDate,
      isDate: isDate
    })
  },
  bindInsurance(e){
    var self = this;
    var index = e.detail.value;
    this.setData({
      insuranceInputValue: self.data.insuranceValue[index].value,
    })
  },
  bindChenyuanNum(e) {
    var self = this;
    var index = e.detail.value;
    this.setData({
      chenyuanNumInputValue: self.data.chenyuanNumValue[index].value,
    })
  },
  navigateTo (e){
    utils.href(e)
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
  //查看更多保险
  showMore (){
    var showMore = !this.data.showMore
    this.setData({
      showMore: showMore
    })
  }, 
  //监听多选框
  checkboxChange: function (e) {
    var index = e.detail.value;

    var items = this.data.items;
    for (var i in items){
      items[i].checked = false;
    }
    var checkboxGroup = {};
    for (var i = 0; i < index.length;i++){
      items[index[i]].checked = true;

      checkboxGroup[items[index[i]].name] = 1;
    }    
    this.setData({
      checkboxGroup: checkboxGroup
    })

    //是否显示第三方责任金额
    this.setData({
      insuranceInputShow: items[1].checked,
      chenyuanNumShow: items[2].checked
    })
    this.isCheckbox();
    //更新保险数据组合

  },
  //是否有多选
  //是否有多选
  isCheckbox() {
    var item = this.data.items;
    var result = false;
    for (var i in item) {
      //console.log(item[i].value+' '+item[i].checked)
      if (item[i].checked) {
        result = true
      }
    }
    //console.log(result)
    this.setData({
      isCheck: result
    })
  },

  upload() {
    var token = this.data.token;
    var that = this;
    this.setData({
      disupload: true
    })
    wx.chooseImage({
      count: 1,  //最多可以选择的图片总数  
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有  
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有  
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片  
        var tempFilePaths = res.tempFilePaths;
        //启动上传等待中...  
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        })
        var uploadImgCount = 0;
        for (var i = 0, h = tempFilePaths.length; i < h; i++) {
          wx.uploadFile({
            url: Api.config.host + '/site/upload',
            filePath: tempFilePaths[i],
            name: 'file',
            formData: {
              'imgIndex': i
            },
            header: {
              "Content-Type": "multipart/form-data",
              'Authorization': 'Bearer ' + token
            },
            success: function (res) {
              that.setData({
                disupload: false,
                isUpload: true
              })
              wx.hideToast();
              var res = JSON.parse(res.data)
              if (res.code == 200) {
                that.setData({
                  travel_img: res.data.url,
                  path: res.data.path
                })
              }
              // uploadImgCount++;
              // var data = JSON.parse(res.data);
              // //服务器返回格式: { "Catalog": "testFolder", "FileName": "1.jpg", "Url": "https://test.com/1.jpg" }  
              // var productInfo = that.data.productInfo;
              // if (productInfo.bannerInfo == null) {
              //   productInfo.bannerInfo = [];
              // }
              // productInfo.bannerInfo.push({
              //   "catalog": data.Catalog,
              //   "fileName": data.FileName,
              //   "url": data.Url
              // });
              // that.setData({
              //   productInfo: productInfo
              // });
              // // wx.showModal({
              // //   title: '错误提示',
              // //   content: '上传图片失败',
              // //   showCancel: false,
              // //   success: function (res) { }
              // // })
              // //如果是最后一张,则隐藏等待中  
              // if (uploadImgCount == tempFilePaths.length) {
              //   wx.hideToast();
              // }
            },
            fail: function (res) {
              wx.hideToast();
              that.setData({
                disupload: false
              })
              wx.showModal({
                title: '错误提示',
                content: '上传图片失败',
                showCancel: false,
                success: function (res) { }
              })
            }
          });
        }
      }
    });
  }

})
