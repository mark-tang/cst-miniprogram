var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
var app = getApp()
Page({
  data: {
    advisorInfo: [
      // {
      //   "accountId": 2018,
      //   "accountName": "lmy123",
      //   "areaId": 1,
      //   "roleId": 10,
      //   "sex": 1,
      //   "qq": "",
      //   "email": "",
      //   "isDelete": 0,
      //   "avatar": "http://img20.16888.com/hpic/c/98/1395111661.png",
      //   "nickname": "李明友",
      //   "qrCode": "http://img20.autoeo.com/sell_member/1/image/qrcode20345.jpg",
      //   "WeChatName": "",
      //   "telephone": "18688888888",
      //   "parentId": 0,
      //   "isForbidden": 0,
      //   "licenseId": "2184",
      //   "licenseExpired": 0,
      //   "accountStatus": true
      // },
      // {
      //   "accountId": 29874,
      //   "accountName": "13562363690",
      //   "areaId": 1,
      //   "roleId": 10,
      //   "sex": 1,
      //   "qq": "",
      //   "email": "",
      //   "isDelete": 0,
      //   "avatar": "http://img20.16888.com/hpic/c/98/1395111661.png",
      //   "nickname": "测试",
      //   "qrCode": "http://img20.16888.com//wxqrcode/1/20137.jpg",
      //   "WeChatName": "",
      //   "telephone": "13562363690",
      //   "parentId": 0,
      //   "isForbidden": 0,
      //   "licenseId": "6911",
      //   "licenseExpired": 0,
      //   "accountStatus": true
      // }
    ]
  },
  onLoad(){
    app.viewRecord();//活跃度统计
    var self = this;
    Api.authGet('/common/advisor-list',{
      type:1,
      random:1
    }, function (res) {
      var res = res.data
      console.log(res)
  
      for(var i in res){
        res[i].isActive = false;
      }
      self.setData({
        advisorInfo: res
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