var utils = require("../../../utils/util.js")
import Api from "../../../utils/api.js";
var supportTime
var timer
var app = getApp()
Page({
  data:{
    locationInfo:'',
    waitTime:'00:00:00',
    estimateTime:'00:00:00',
    hdText:' - ',
    ftText:' ',
    isComple:false,
  },
  onLoad (){
    app.viewRecord();//活跃度统计
    this.queryData();
  },
  onUnload(){
    clearInterval(supportTime)
  },
  queryData (){
    var self = this;
    wx.getStorage({
      key: 'helpId',
      success: function(res) {
        self.setData({
          helpId: res.data
        })
        Api.authGet('/support/get-support', {
          id: res.data
        }, function (res) {
          if (res.data.status == 0){
            self.calcHelpTime(res.data.dateline / 0.001)
            self.setData({
              hdText:'正在为您安排救援',
              ftText:'请耐心等待',
            })
          } else if (res.data.status == 1){
            const estimateTime = self.formatTime(new Date(res.data.estimate_dateline*1000))
            var helpPhone = res.data.u_phone || res.data.SA_phone
            self.setData({
              hdText: '距离'+res.data.distance+'公里, 预计到达',
              waitTime: estimateTime,
              ftText: '火速前往中',
              helpPhone: helpPhone,
            })
          } else if (res.data.status == 2) {
            self.setData({
              hdText: '已完成此次救援',
              waitTime: '完成救援',
              ftText: '感谢使用',
              isComple: true,
            })
            clearInterval(timer)
            clearInterval(supportTime)
          } else if (res.data.status == 4) {
            self.setData({
              isComple: true,
            })

            wx.showModal({
              title: '拒绝救援',
              content: '拒绝救援描述：' + res.data.refuse_case,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
            clearInterval(timer)
            clearInterval(supportTime)
          }

          self.helpComing();
          wx.hideLoading();
        })
      }
    })
  },
  helpComing(){
    var self = this;
    var id = this.data.helpId
    supportTime = setInterval(function(){
      Api.authGet('/support/get-support', {
        id: id
      }, function (res) {      
        if (res.data.status == 1) {
          const estimateTime = self.formatTime(new Date(res.data.estimate_dateline * 1000))
          var helpPhone = res.data.au_tel
          self.setData({
            hdText: '距离' + res.data.distance + '公里, 预计到达',
            waitTime: estimateTime,
            ftText: '火速前往中',
            helpPhone: helpPhone,
          })
          clearInterval(timer)
          
        } else if (res.data.status == 2){
          self.setData({
            hdText: '已完成此次救援',
            waitTime: '完成救援',
            ftText: '感谢使用',
            isComple:true,
          })
          clearInterval(timer)
          clearInterval(supportTime)
        } else if (res.data.status == 4) {
          self.setData({
            isComple: true,
          })

          wx.showModal({
            title: '拒绝救援',
            content: '拒绝救援描述：' + res.data.refuse_case,
            showCancel:false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
          clearInterval(timer)
          clearInterval(supportTime)
        }
      })
    },1500)

  },
  //拨打电话
  callNum() {
    var helpPhone = this.data.helpPhone
    if (helpPhone){
      wx.makePhoneCall({
        phoneNumber: helpPhone
      })
    }else{
      wx.getStorage({
        key: 'helpTel',
        success: function (res) {
          wx.makePhoneCall({
            phoneNumber: res.data
          })
        },
      })
    }
  },
  formatTime(date){
    var self = this;
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    return [hour, minute].map(self.formatNumber).join(':')
  },
  formatNumber(n) {
    n = n.toString()
  return n[1] ? n : '0' + n
  },
  //取消
  cancelHelp (){

    var self = this
    this.setData({ isDisabled:true})
    wx.showModal({
      title: '',
      content: '确认取消此次道路救援？',
      success: function (res) {
        if (res.confirm) {
          cancelThisHelp();
        } else if (res.cancel) {
          console.log('用户点击取消')
          self.setData({ isDisabled: false })
        }
      }
    })
    function cancelThisHelp(){
      wx.showLoading({
        title: '取消中...',
      })
      Api.authGet('/support/cancel',{
        id: self.data.helpId
      },function(res){
        wx.hideLoading();
        wx.showToast({
          title: '已取消',
        })
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        },1000)
      })
    }

  },
  //计算显示救援时间
  calcHelpTime: function (helpTime) {
    var self = this;
    timer = setInterval(showTime,1000)
    function showTime() {
      var nowTime = Date.now();
      var diffTime = parseInt((nowTime - helpTime) / 1000);
      self.setData({
        waitTime: formatSeconds(diffTime)
      })
    }
    function formatSeconds(time) {
      var h = 0,
        m = 0,
        s = 0,
        _h = '00',
        _m = '00',
        _s = '00';
      h = Math.floor(time / 3600);
      time = Math.floor(time % 3600);
      m = Math.floor(time / 60);
      s = Math.floor(time % 60);
      _s = s < 10 ? '0' + s : s + '';
      _m = m < 10 ? '0' + m : m + '';
      _h = h < 10 ? '0' + h : h + '';
      return _h + ":" + _m + ":" + _s;
    }

  }
})