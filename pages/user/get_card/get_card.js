var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";

var app = getApp()
Page({
  data: {
    cardList: []
  },
  onLoad (options){
    console.log(options)
    this.setData({
      apply_id: JSON.parse(options.apply_id)
      // apply_id: options.apply_id
    })
    app.viewRecord();//活跃度统计
    var self = this;
    /* wx.showLoading({
      title: '加载中...',
    }) */
    app.getSystemInfo((res) => {
      console.log(res.windowHeight)
      
      self.setData({
        windowHeight: res.windowHeight - res.windowWidth / 750 * 102
      })
    })
    this.queryData();
    
  },
  queryData(){
    var self=this;
    wx.showLoading({
      title: '加载中...',
    })
    Api.authPost('/coupon/apply/receive', {apply_id:self.data.apply_id}, function (res) {
      wx.hideLoading();
      /* let res = {
        "code": 200,
        "msg": "ok",
        "data": {
          "title": "卡券1",
          "card_type": "优惠券",
          "notice": "一串使用提醒文字",
          "effect_date_desc": "截止到2018-12-20前有效",
          "right_desc": "优惠券"
        }
      } */
      if(res.code == 200){
        let cardList = [];
        if(res.data instanceof Array){
          cardList = res.data;
        }else{
          cardList.push(res.data);
        }
        self.setData({
          cardList: cardList
        })
        console.log(this.data.cardList)
      }else {
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
  //提交数据
  submitForm(e) {
    let apply_id = this.data.apply_id;
      // JSSDK的添加卡券
        let url = '/coupon/apply/receive-now'
        if(apply_id.constructor === Array){
          url = '/coupon/apply/group-receive-now'
        }
        wx.showLoading({
          title: '加载中...',
        })
        Api.authPost(url, {apply_id: apply_id}, function (res) {
          if (res.code == 200) {
            // 如果后台返回的不是一个数组
            let cardData = [];
            if(apply_id.constructor === Array && res.data.constructor === Array){
              cardData = res.data;
              for (var i = 0; i < cardData.length; i++) {
                cardData[i].cardExt = JSON.stringify(cardData[i].cardExt);
              }
            }else {
              res.data.cardExt = JSON.stringify(res.data.cardExt)
              cardData.push(res.data);
            }
            wx.addCard({
              cardList: cardData, // 需要添加的卡券列表
              success(res) {
                var cardList = res.cardData; // 添加的卡券列表信息
                console.log(res.cardList) // 卡券添加结果
              },
              error(res) {
                this.$dialog.toast({
                  mes: res.errMsg,
                  timeout: 2500
                });
              }
            });
            /* wx.addCard({
              cardList: [{
                "cardExt": '{"nonce_str":"42a34c6e84334c69961f5294643ad331","code":"892237947","signature":"6211eb80ec26b4054c566b3a7d1868fa304183f4","timestamp":"1541723819"}',
                "cardId": "pCS2i1DQQWELTTEcORmb-irOTRqo"
              }],
              success(res) {
                console.log(res.cardList) // 卡券添加结果
              }
            }); */
          } else {
            utils.toast(res.msg)
          }
  
        })
  },
  
})
