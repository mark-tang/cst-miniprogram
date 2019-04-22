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
    Api.authGet('/common/advisor-list',{
      type:3,
      random:1
    }, function (res) {
      var res = res.data
      console.log(res)
      var id = options.id;
      for(var i in res){
        res[i].isActive = false;
        if (id){
          if (res[i].accountId == id){
            res[i].isActive = true;
          }
        }
      }
      self.setData({
        advisorInfo: res,
        showPage:true,
      })
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
      isAdvisor: true
    })
    console.log(this.data.advisorInfo)
  },
  submitBtn(e){
    var advisorInfo = this.data.advisorInfo;
    var isChosed = false;
    var chosedAdvisor = ''
    var advisorId =''
    for (var i in advisorInfo){
      if (advisorInfo[i].isActive){
        isChosed = true;
        chosedAdvisor = advisorInfo[i].nickname;
        advisorId = advisorInfo[i].accountId;
      }
    }
    if (isChosed ){
      utils.toPrepageData({
        isChosed: isChosed,
        isXubao:true,
        chosedAdvisor: chosedAdvisor,
        advisorId: advisorId,
      })
      wx.navigateBack({
        delta: 1
      })
    }else{
      utils.toast('请选择续保专员')
    }
  }
})