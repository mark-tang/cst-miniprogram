var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
var app = getApp()
var app = getApp()
Page({
  data: {
    showMask:false,
    showPopus:false,
    dateTips:'请选择',
    date:'',
    nowDate:''
  },
  onReady (e){
    this.limitDate()
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
    this.setData({
      type: options.type
    })
    wx.setNavigationBarTitle({
      title: options.type == 1 ? '添加保险记录' : '设置保险到期提醒'
    })
  },

  bindDateChange(e) {
    this.setData({
      date: e.detail.value,
      dateTips: e.detail.value,
    })
  },
  //限制日期选择
  limitDate (){
    var date = new Date();

    var year = date.getFullYear();
    var month = date.getMonth() + 7;
    var day = date.getDate();
    this.setData({
      nowDate : [year, month, day].join('-')
    })
  },
  //表单提交
  submitForm(e) {
    //数据验证
    var self=this;
    
    if (!this.data.date){
      utils.toast('请选择日期')
    } else{
      this.setData({ isSubmit: true })
      let url = self.data.type == 1 ? '/baoxian/set' :'/baoxian/set-expiration-time'
      Api.authPost(url, {
        date: this.data.date,
        from:2
      }, function (res) {
        var res = res.data;
        wx.setStorage({
          key: 'isReload',
          data: 'true',
        })
        wx.showToast({
          title: self.data.type==1?'添加成功':'设置成功',
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
