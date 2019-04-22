//获取应用实例
var app = getApp()
Page({
  data: {
    showPage: false,
  },
  onLoad() {
    var self = this;
    wx.showLoading({ title: '加载中...' })
    app.Api.get('/v2/common/model-list').then(response => {
      wx.hideLoading();
      
      const { code, data, msg } = response;
      for (var index in data) {
        Object.assign(data[index], {
          show: index == 0 ? true : false
        })
      }
    
      self.setData({
        showPage: true,
        carList: data
      })
      app.viewRecord();//活跃度统计
    })
  },
  //列表抽屉
  showChild(e) {
    var index = e.currentTarget.id;
    console.log(index)
    var list = this.data.carList;
    list[index].show = !list[index].show;
    this.setData({
      carList: list
    })
  },
  // offCanvas
  animation: wx.createAnimation({
    duration: 300,
    timingFunction: 'ease-in-out',
  }),
  // 选择车型
  selectCarModel: function (e) {
    let data = e.currentTarget.dataset;
    wx.showLoading({ title: '加载中...' });
    app.Api.get('/common/get-car-list', data).then(response => {
      wx.hideLoading();
      const { code, data, msg } = response
      if (code == 200) {
        this.setData({
          carStyle: data
        })
        this.toggle();
      } else {
        wx.showToast({ title: msg })
      }
    })
  },
  toggle: function () {
    if (this.data.showModel) { // 隐藏
      this.animation.translateX('100%').step();
    } else {                   // 显示
      this.animation.translateX('0%').step();
    }
    this.setData({
      animation: this.animation.export(),
      showModel: !this.data.showModel
    });
  },
  selectCarStyle: function (e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    let data = Object.assign(
      { carInfo: e.currentTarget.dataset },
      { isCar: true }
    );

    prevPage.setData(data);
    wx.navigateBack()
  }
})