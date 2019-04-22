var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";

var app = getApp()
Page({
  data: {
    region: ['', '', '']
  },
  onLoad (){
    app.viewRecord();//活跃度统计
    var self = this;
    
  },
  
  bindRegionChange(e) {
    this.setData({
      region: e.detail.value,
      showAdress: true
    })
  },
  submitForm(e) {
    var self = this;
    console.log(e.detail.value)
    var region = self.data.region
    var name = e.detail.value.name;
    var phone = e.detail.value.phone;
    var adressmore = e.detail.value.adressmore

    if (!name){
      utils.toast('请填写姓名')
    } else if (!phone){
      utils.toast('请填写手机号码')
    } else if (!utils.isMobile(phone)) {
      utils.toast('手机号码格式错误')
    } else if (!self.data.showAdress) {
      utils.toast('请选择地区信息')
    } else if (!adressmore) {
      utils.toast('请填写详细信息')
    }else{
      self.setData({ isSubmit: true })
      wx.showLoading({title: '加载中...'})
      Api.authPost('/mall/address/edit', {
        name: name,
        tel: phone,
        provice: region[0],
        city: region[1],
        counties: region[2],
        detail_info: adressmore,
        nationalCode: '100086'
      }, function (res) {
        if(res.code == 200){
          wx.showToast({
           title: '添加成功',
           mask: true,
          })
          self.setData({ isSubmit: false })
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
