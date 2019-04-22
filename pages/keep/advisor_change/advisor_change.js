var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    advisorInfo: [],
    showPage:false,
  },
  onLoad(options){
    app.viewRecord();//活跃度统计
    var self = this;
    if(options.type == 2){
      Api.authGet('/customer/advisor-list', {}, function (res) {

        var res = res.data
        console.log(res)
        for (var i in res) {
          res[i].isActive = false;
        }
        
        self.setData({
          advisorInfo: res,
          evaType: options.type,
          showPage: true,
          adType:'销售'
        })
      })
      wx.setNavigationBarTitle({
        title: '更换销售顾问'
      })
    }else if(options.type == 1){
      Api.authGet('/owner/sale-advisor-list', {}, function (res) {

        var res = res.data
        console.log(res)

        for (var i in res) {
          res[i].isActive = false;
        }
        
        self.setData({
          advisorInfo: res,
          evaType: options.type,
          showPage: true,
          adType: '售后'
        })
      })     
      wx.setNavigationBarTitle({
        title: '更换售后顾问'
      }) 
    }

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
      selectAdvisorId:thisData[index].au_id
    })
    
  },
  submitBtn(e){
    var self = this;
    var advisorInfo = this.data.advisorInfo;
    var isChosed = this.data.isAdvisor;
    var chosedAdvisor = ''
    var advisorId = this.data.selectAdvisorId

    console.log(advisorId)
    if (isChosed ){
      if (self.data.evaType == 2){
        wx.showLoading({
          title: '提交中...',
          mask: true,
        })
        Api.authGet('/customer/change-advisor',{
          au_id: advisorId
        },function(res){
          wx.showToast({
            title: '更换成功',
            mask: true,
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 2
            })
          }, 1500)
        })
      } else if (self.data.evaType == 1){
        wx.showLoading({
          title: '提交中...',
          mask: true,
        })
        Api.authPost('/owner/change-service', {
          id: advisorId
        }, function (res) {        
          wx.showToast({
            title: '更换成功',
            mask: true,
          })  
          setTimeout(function(){
            wx.navigateBack({
              delta: 2
            })
          },1500)
        })
      }
      
    }else{
      utils.toast('请选择要更换的售后顾问')
    }
  }
})