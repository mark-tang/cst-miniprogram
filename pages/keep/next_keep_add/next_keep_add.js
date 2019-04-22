var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";

var app = getApp()
Page({
  data: {
    showMask:false,
    showPopus:false,
    dateTips:'选择上次保养的日期',
    date:'',
    lastMileage:'',
  },
  onLoad (){
    app.viewRecord();//活跃度统计
    wx.showLoading({
      title: '加载中...',
    })
    var self = this;
    Api.authPost('/by-wx/latest-record', {}, function (res) {
      var res = res.data;
      
      self.setData({
        lastDate: res.b_dateline?res.b_dateline:'',
        lastMileage: res.b_km?res.b_km:'',
      })
    })
    this.limitDate()
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
  bindDateChange(e) {
    this.setData({
      date: e.detail.value,
      dateTips: e.detail.value,
    })
  },
  submitForm(e) {
    var self = this;
    //数据验证
    var mileage = e.detail.value.mileage;
    var money = e.detail.value.money;
    if (!this.data.date){
      utils.toast('请选择日期')
    } else if (!mileage){
      utils.toast('请填写里程')
    } else if (Number(mileage) < Number(self.data.lastMileage)){
      console.log(mileage + '<' + self.data.lastMileage)
      utils.toast('保养里程不能小于上次保养里程')
    } else if (!money){
      utils.toast('请填写金额')
    } else{
      self.setData({ isSubmit: true })
      //提示成功
      Api.authPost('/by-wx/edit',{
        money: money,
        date: this.data.date,
        km: mileage,
        from:3
      },function(res){
        wx.setStorage({
          key: 'isReload',
          data: 'true',
        })
        wx.showToast({
          title: '添加成功',
          mask: true,
        })
        //1.5秒跳转  
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      })
      
    }
    
    
  }
   
})
