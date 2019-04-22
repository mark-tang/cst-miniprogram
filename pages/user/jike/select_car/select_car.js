//获取应用实例
import Api from "../../../../utils/api.js";

var app = getApp()
Page({
  data: {
    showPage: false,
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    var self = this;
    wx.showLoading({ title: '加载中...' })
    Api.get('/v2/common/model-list').then(response => {
      wx.hideLoading();
      const { code, data, msg } = response;
      for (var index in data) {
        Object.assign(data[index], {
          show: index == 0 ? true : false
        })
      }
      self.setData({
        showPage: true,
        carList: data,
        type: options.type,
      })
    })
  },
  getCarInfo(e) {
    let self = this;
    let type = this.data.type;
    if(type == 2){
      self.dataForPrepage(e);
    }else if(type == 1) {
      self.getCarStyle(e);
    }
  },
  // 选择车型
  getCarStyle(e) {
    let self = this;
    let data = e.currentTarget.dataset;
    wx.showLoading({ title: '加载中...' });
    Api.get('/common/get-car-list', data).then(response => {
      wx.hideLoading();
      const { code, data, msg } = response;
      if (code == 200) {
        self.setData({
          carStyle: data
        })
        self.toggle();
      } else {
        wx.showToast({ title: msg })
      }
    })
  },
  dataForPrepage(e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];

    prevPage.setData(e.currentTarget.dataset);
    console.log(e.currentTarget.dataset);
    wx.navigateBack();
  },
  // 手风琴
  modelToggle(e) {
    var index = e.currentTarget.id;
    var list = this.data.carList;
    list[index].show = !list[index].show;
    this.setData({
      carList: list
    })
  },
  // 侧滑列表
  animation: wx.createAnimation({
    duration: 300,
    timingFunction: 'ease-in-out',
  }),
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
  
})