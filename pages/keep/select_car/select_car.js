//获取应用实例
var app = getApp()
Page({
  data: {
    showPage: false,
  },
  onLoad() {
    app.viewRecord();//活跃度统计
    var self = this;
    wx.showLoading({
      title: '加载中...',
    })
    app.Api.authPost('/v2/common/model-list', {}, function (res) {
      var carList = res.data
      for (var i in carList) {
        if (i == 0) {
          console.log(carList[i])
          carList[i].show = true
        } else {
          carList[i].show = false
        }
      }
      self.setData({
        showPage: true,
        carList: carList
      })
      wx.hideLoading();
    })
  },
  //选择车型
  selectCar: function (e) {
    console.log(e.currentTarget.dataset)
    let data = Object.assign(e.currentTarget.dataset, { isCar: true });
    app.Api.Utils.toPrepageData(data);
    wx.navigateBack({ delta: 1 })
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
  navigateTo: function (e) {
    app.Api.Utils.href(e)
  }
})