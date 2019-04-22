let app = getApp();
Page({
  data: {
    isSubmit: false
  },

  onLoad: function (options) {
    let self = this;

    if (options.car_id) {
      wx.showLoading({ title: '加载中...' })
      app.Api.get('/common/car-simple-info', options).then(response => {
        wx.hideLoading();
        self.setData({ showPage: true });
        const {code, data, msg} = response;
        if (code == 200) {
          app.getCustomerInfo().then(response => {
            const { isExsit, customer_info } = response;
            this.setData({
              isCar: true,
              carInfo: {
                car_name: data.car,
                model_logo: data.img[160] || data.img[260],
                shop_price: data.shop_price,
              },
              car_id: options.car_id,
              customer_info: customer_info
            });
          });
        } else {
          app.Api.Utils.toast('无法获取车型信息');
        }
      })
    } else {
      app.getCustomerInfo().then(response => {
        const {isExsit, customer_info} = response;
        this.setData({
          isCar: true,
          showPage: true,
          carInfo: {
            car_name: customer_info.car_name,
            model_logo: customer_info.car_img[160],
            shop_price: customer_info.car_price.shop_price
          },
        });
      });
    }
  },
  onShow(){
    app.viewRecord();//活跃度统计
  },

  submitForm: function (e) {
    var self = this;
    if (!e.detail.value.name) {
      app.Api.Utils.toast('请输入姓名');
    } else if (!e.detail.value.phone) {
      app.Api.Utils.toast('请输入电话');
    } else if (!e.detail.value.content) {
      app.Api.Utils.toast('请输入您所期望的优惠');
    } else {
      self.setData({ isSubmit: true });

      let formData = {
        car_id: self.data.car_id,
        content: e.detail.value.content,
        name: e.detail.value.name,
        tel:e.detail.value.phone,
        formId: e.detail.formId,
      }

      app.Api.post('/sell-ask/create', formData).then(response => {
        const {code, data, msg} = response;
        if ( code == 200 ) {
          wx.showToast({
            title: '提交询价成功',
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
          
        } else {
          self.setData({ isSubmit: false });
          app.Api.Utils.toast(msg);
        }
      })
    }
  },
  onShareAppMessage: function () {
    var self = this;
    return {
      title: this.data.carInfo.car_name,
      path: '/pages/buy/price_inquiry_create/price_inquiry_create?method=share' +
      '&car_id=' + self.data.car_id,
      success: function (res) {
        // 转发成功

      },
      fail: function (res) {

      }
    }
  }
})