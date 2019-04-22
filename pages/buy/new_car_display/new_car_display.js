let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {},
    showPage: false,
    tipsList: [
      { first: '暂无优惠信息', second: '' },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (params) {
    // wx.showLoading({ title: '加载中...' });
    this.postDetail(params.id).then(response => {
      wx.hideLoading();
      const {code, data, msg} = response;
      if (code == 200) {
        let models = data.models;
        for (let i in models) {
          models[i].calcPrice = (models[i].factoryPrice - models[i].shopPrice).toFixed(2)
        }
        this.setData({
          model_id: params.id,
          data: data,
          models: models,
          showPage: true,
          btnType: params.type
        });
      } else {

      }
    });
    // app.Api.post('/sell-sales/index', { type: 1 }).then(response => {
    //   const {code, data, msg} = response;
    //   if (code == 200) {
    //     var tipsList = [];
    //     var listData = data.list.data;
    //     if (listData.length == 0) {
    //       return;
    //     }
    //     for (var i = 0; i < listData.length; i = i + 2) {
    //       var obj = { first: listData[i].title, second: listData[i + 1].title }
    //       tipsList.push(obj);
    //     }
    //     console.log(tipsList);
    //     self.setData({
    //       tipsList: tipsList
    //     });
    //   }
    // });
  },
  onShow(){
    app.viewRecord();//活跃度统计
  },

  postDetail: function (id) {
    return app.Api.post('/show-cars/model-detail', { id: id });
  },

  navigateTo: function (e) {
    app.Api.Utils.href(e);
  },
  onShareAppMessage: function () {
    var self = this;
    return {
      title: data.title,
      path: '/pages/buy/new_car_display/new_car_display?method=share' + '&id=' + self.data.model_id + '&type=' + self.data.btnType,
      success: function (res) {
        // 转发成功

      },
      fail: function (res) {

      }
    }
  }
})