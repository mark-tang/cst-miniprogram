var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    showMask: false,
    showPopus: false,
    dateTips: '请选择',
    date: '',
  },
  
  onReady() {
    app.viewRecord();//活跃度统计
    this.limitDate()
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value,
      dateTips: e.detail.value,
    })
  },
  //限制日期选择
  limitDate () {
    var date = new Date();

    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    this.setData({
      nowDate: [year, month, day].join('-')
    })
  },
  submitForm(e) {
    //数据验证
    var self = this;
    if (!this.data.date) {
      utils.toast('请选择日期')
    } else {
      self.setData({ isSubmit: true })
      Api.authPost('/nianjian/set', {
        date: this.data.date,
        from:2
      }, function (res) {
        var res = res.data;
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
