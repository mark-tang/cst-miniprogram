//index.js
var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";

//获取应用实例
var app = getApp()

Page({
  data: {
    timeToStore: '请选择到店时间',
    isChosedTime: false,
    showPage: false,
    carNumbersIndex: '0',
    serviceTypeIndex: '1',
  },
  onLoad() {
    app.viewRecord();//活跃度统计
    var self = this;
    wx.showLoading({
      title: '加载中...',
    })

    this.yuyueInit()

    this.indexInit()

    if (app.scene == 1014) { // 模板消息来的
      self.setData({
        isFrom: true
      })
    }
  },
  // 是否有预约活动
  yuyueInit() {
    let self = this
    Api.authPost('/active/yuyue', {
      type: 2
    }, function (res) {
      if (res.data.now_timeStamp) {
        self.setData({
          showLottery: true,
          lotteryTitle: res.data.name,
          lotteryId: res.data.id,
          lotteryType: res.data.category_sub_type,
        })
      }
    },function(){
      
    })
  },
  // 首页数据初始化
  indexInit() {
    let self = this
    Api.authGet('/yangxiu/new-index', {}, function (res) {

      const { data, code } = res

      let serviceType = []
      let originServiceType = data.project
      for (let i in originServiceType) {
        serviceType.push({
          name: originServiceType[i],
          value: i,
          checked: i == 1
        })
      }
      let selectIndx = 0;
      for (let j = 0; j < data.car_numbers.length; j++) {
        data.car_numbers[j].car_model_name = data.car_numbers[j].car_model_name || data.car_numbers[j].car_import_name || '未知车系';
        if (data.car_numbers[j].u_id == data.inuse_car) {
          selectIndx = j;
        }
      }
      self.setData({
        showPage: true,
        carNumbers: data.car_numbers,
        name: data.name,
        phoneNum: data.phone,
        serviceType: serviceType,
        carNumbersIndex: selectIndx,
      })

      // 是否显示活动横幅信息
      if (data.preferenceTips) {
        self.setData({
          showTips: true,
          tipstext: data.preferenceTips.content,
          tipsTime: data.preferenceTips.aheadTime
        })
      }

    })
  },
  carNumbersPicker(e) {
    this.setData({
      carNumbersIndex: e.detail.value
    })
  },
  radioChange: function (e) {
    this.setData({
      serviceTypeIndex: e.detail.value
    })
  },
  //提交表单
  submitForm(e) {
    let self = this;
    let inputValue = e.detail.value
    console.log(this.data.carNumbers)
    console.log(this.data.carNumbersIndex)
    let carNumbers,uid;
    if (this.data.carNumbers.length>0){
     carNumbers = this.data.carNumbers[this.data.carNumbersIndex].b_chepai_num;
     uid = this.data.carNumbers[this.data.carNumbersIndex].u_id;
    }
    let params = {
      project: this.data.serviceTypeIndex,  // 服务类型
      totime: this.data.timeToStore,        // 到店时间
      contacts: inputValue.name,            // 车主姓名
      phone: inputValue.phone,              // 联系电话
      b_chepai_num: carNumbers,             // 车牌号码
      uid: uid,
      discount_content: this.data.discountContent,  // 折扣内容
      from:2,
      formId: e.detail.formId
    }

    if (!params.contacts) { utils.toast('请填写姓名'); return }
    if (!params.phone) { utils.toast('请填写电话'); return }
    if (!this.data.isChosedTime) { utils.toast('请选择到店时间'); return }

    wx.showLoading({
      title: '提交中...',
      mask: true,
    })
    self.setData({
      isSubmit: true
    })
    Api.authPost('/yangxiu/new-add', params, function (res) {
      if (res.code == 200) {
          if (self.data.showLottery &&res.data.can_award) {
            wx.showModal({
              showCancel: true,
              cancelText: '返回',
              confirmText: '去抽奖',
              content: res.data.succTips,
              success: function (res) {
                if (res.confirm) {
                  var type = self.data.lotteryType;
                  var id = self.data.lotteryId;
                  var title = self.data.lotteryTitle;
                  if (type == 1) {
                    wx.navigateTo({
                      url: '/pages/user/lottery_draw/lottery_draw?test=1' + '&id=' + id + '&type=2' + '&title=' + title,
                    })
                  } else if (type == 2) {
                    wx.navigateTo({
                      url: '/pages/user/lottery_golden_egg/lottery_golden_egg?test=1' + '&id=' + + id + '&type=2' + '&title=' + title,
                    })
                  }

                } else if (res.cancel) {
                  wx.navigateBack({
                    delta: 1
                  })
                }
              }
            })
        } else {
          wx.showToast({
            title: '预约成功',
            icon: 'success',
            duration: 1500
          })
          setTimeout(function () {
            wx.navigateBack();
          }, 1500)
        }

      }
    }, function (err) {
      if (err.code == '200001') {
        let uid = self.data.carNumbers[self.data.carNumbersIndex].u_id;
        wx.showModal({
          confirmText: '取消预约',
          cancelText: '暂时不用',
          content: '如需新的预约，请先完成当前预约或取消当前预约',
          success: function (res) {
            if (res.confirm) {
              Api.authPost('/yangxiu/new-cancel-all', { uid: uid }, function (res) {
                if (res.code == '200') {
                  wx.showToast({
                    title: '取消成功',
                    icon: 'success',
                    duration: 2000
                  })
                }
              })
            }
          }
        })
      } else {
        utils.toast(err.msg)
      }
    })
  },
  navigateTo(e) {
    utils.href(e)
  }
})
