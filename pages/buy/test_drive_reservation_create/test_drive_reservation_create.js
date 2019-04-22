import Api from "../../../utils/api.js";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPage: false,
    time: '',
    start: null,
    isCar: false,
    hasLastAppoint:false,
  },
  onShow(){
    app.viewRecord();//活跃度统计
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    let self = this;
    Api.authPost('/active/yuyue', {
      type: 1
    }, function (res) {
      if (res.data.id) {
        self.setData({
          showLottery: true,
          lotteryTitle: res.data.name,
          lotteryId: res.data.id,
          lotteryType: res.data.category_sub_type,
        })
      }
    }, function (res) {

    })
    let t = new Date();
    app.getCustomerInfo().then(response => {
      const { isExsit, customer_info } = response;
      this.setData({
        isCar: true,
        carInfo: {
          car_id: options.car_id,
          car_name: customer_info.car_name,
          model_logo: customer_info.car_img[160],
          shop_price: customer_info.car_price.shop_price
        },
        customer_info: customer_info,
        start: `${t.getFullYear()}-${t.getMonth() + 1}-${t.getDate()}`
      });
    });
    if (options.car_id) {
      wx.showLoading({ title: '加载中...' })
      app.get('/common/car-simple-info', options).then(response => {
        wx.hideLoading();
        self.setData({ showPage: true });
        const { code, data, msg } = response;
        if (code == 200) {
          self.setData({
            isCar: true,
            carInfo: {
              car_name: data.car,
              model_logo: data.img[160] || data.img[260],
              shop_price: data.shop_price
            }
          })
        } else {
          app.Api.Utils.toast('无法获取车型信息');
        }
      })
    } else {
      self.setData({ showPage: true });
    }

    app.get('/sell-promise/index').then(response => {
      const status = response.data.list.data[0].status;
      console.log(status)
      if (status == 0 || status == 2){
        self.setData({
          hasLastAppoint: true,
          lastAppointId: response.data.list.data[0].id
        });
      }
    })
  },
  

  navigateTo: function (e) {
    app.Api.Utils.href(e);
  },

  dateChange: function (e) {
    this.setData({ date: e.detail.value })
  },
  timeChange: function (e) {
    this.setData({ time: e.detail.value });
  },
  hasAppointHandle (){
    let self = this;
    wx.showModal({
      content: '如需要新的预约，请先完成当前预约或取消当前预约',
      confirmText:'取消预约',
      cancelText:'暂时不用',
      success: function (res) {
        if (res.confirm) {
          self.appointCancel();
        } else if (res.cancel) {
          
        }
      }
    })
  },
  appointCancel() {
    wx.showLoading({title:'取消中'})
    app.get('/sell-promise/cancel', {}).then(response => {
      const { code, data, msg } = response;
      wx.hideLoading()
      if (code == 200) {
        app.Api.Utils.toast('已取消上次预约');
        this.setData({
          hasLastAppoint: false,
        });
      }else {
        app.Api.Utils.toast(msg);
      }
    })
  },
  formSubmit: function (e) {
    let self = this;
    if (!self.data.isCar) {
      app.Api.Utils.toast('请选择车型');
    } else if (!e.detail.value.yuyueDay_date) {
      app.Api.Utils.toast('请选择到店日期');
    } else if (!e.detail.value.name) {
      app.Api.Utils.toast('请填写姓名');
    } else if (!e.detail.value.tel) {
      app.Api.Utils.toast('请填写电话');
    } else if (!e.detail.value.yuyueData_time) {
      app.Api.Utils.toast('请选择到店时间');
    } else if (self.data.hasLastAppoint) {
      self.hasAppointHandle();
    } else {
      self.setData({ isSubmit: true });
      let t = new Date(`${e.detail.value.yuyueDay_date} ${e.detail.value.yuyueData_time}`.replace(/-/g, '/'));
      const formData = {
        car_name: self.data.carInfo.car_name,
        yuyueDay: parseInt(t.getTime() / 1000),
        remark: e.detail.value.remark,
        car_id: self.data.customer_info.car_id,
        name: e.detail.value.name,
        tel: e.detail.value.tel,
        formId: e.detail.formId,
      }
      console.log(formData);
      this.create(formData).then(response => {
        const { code, data, msg } = response;
        if (code == 200) {
          if (self.data.showLottery) {
            wx.showModal({
              showCancel: true,
              cancelText: '返回',
              confirmText: '去抽奖',
              content: '预约成功！您可以参加我们预约试驾的抽奖活动去碰碰运气！',
              success: function (res) {
                if (res.confirm) {
                  self.setData({ isSubmit: false });
                  var type = self.data.lotteryType;
                  var id = self.data.lotteryId;
                  var title = self.data.lotteryTitle;
                  if (type == 1) {
                    wx.navigateTo({
                      url: '/pages/user/lottery_draw/lottery_draw?test=1' + '&id=' + id + '&type=1' + '&title=' + title,
                    })
                  } else if (type == 2) {
                    wx.navigateTo({
                      url: '/pages/user/lottery_golden_egg/lottery_golden_egg?test=1' + '&id=' + + id + '&type=1' + '&title=' + title,
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
            })
            setTimeout(function (){
              wx.navigateBack();
            },1000)
            
            console.log(data)
          }

        } else {
          self.setData({ isSubmit: false });
          app.Api.Utils.toast(msg);
        }
      });
    }
  },
  create: function (params) {
    return app.post('/sell-promise/create', params);
  },
  onShareAppMessage: function () {
    var self = this;
    return {
      title: this.data.carInfo.car_name,
      path: '/pages/buy/test_drive_reservation_create/test_drive_reservation_create?method=share' +
      '&car_id=' + self.data.car_id,
      success: function (res) {
        // 转发成功

      },
      fail: function (res) {

      }
    }
  }
})