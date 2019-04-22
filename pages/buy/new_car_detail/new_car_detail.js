var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPage: false,
    showModel: false,
    animation: '',
    data: {},
    imgs: [],
    models: [],
    model_id: 0,
  },

  onLoad: function (options) {
    this.setData(options);
    this.queryData(options);
  },
  onShow(){
    app.viewRecord();//活跃度统计
  },

  queryData: function (options) {
    const { car_id, model_id } = options;
    this.postDetail(car_id);
    this.postImgs(model_id);
  },

  postDetail: function (id) {
    wx.showLoading({ title: '加载中...' })
    app.post('/show-cars/params', { car_id: id }).then(response => {
      wx.hideLoading();
      const {code, data, msg} = response;
      if (code == 200) 
        data.calcPrice = (data.factory_price - data.shop_price).toFixed(2);
        this.setData({ data: data, showPage: true });
    });
  },

  postImgs: function (modelId) {
    app.post('/show-cars/imgs', { modelId: modelId }).then(response => {
      const {code, data, msg} = response;
      if (code == 200)
        this.setData({ imgs: data })
    })
  },

  initCarModel: function () {
    const { model_id, models } = this.data;
    if (models.length == 0) {
      wx.showLoading({ title: '加载中...' });
      app.post('/show-cars/model-detail', { id: model_id }).then(response => {
        wx.hideLoading();
        const {code, data, msg} = response;
        if (code == 200) {
          this.setData({
            models: data.models
          })
        }
      });
    }
  },

  animation: wx.createAnimation({
    duration: 300,
    timingFunction: 'ease-in-out',
  }),

  /**
   * 底部弹窗--model-actions
   */
  toggle: function () {
    this.initCarModel()
    if (this.data.showModel) {
      this.animation.translateY('100%').step()
    } else {
      this.animation.translateY('0%').step()
    }
    this.setData({
      animation: this.animation.export(),
      showModel: !this.data.showModel
    });
  },
  
  navigateTo: function (e) {
    app.Api.Utils.href(e);
  },

  showImgs: function () {
    wx.previewImage({
      current: this.data.imgs[0], // 当前显示图片的http链接
      urls: this.data.imgs // 需要预览的图片http链接列表
    })
  },
  reload: function (e) {
    this.queryData(e.currentTarget.dataset);
    this.toggle();
  },
  onShareAppMessage: function () {
    var self = this;
    return {
      title: this.data.data.style,
      path: '/pages/buy/new_car_detail/new_car_detail?method=share' + 
      '&car_id=' + self.data.car_id +
      '&model_id=' + self.data.model_id,
      // path: '/pages/buy/index/index',
      success: function (res) {
        // 转发成功

      },
      fail: function (res) {

      }
    }
  }
});