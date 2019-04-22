let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: { },
  onShow(){
    app.viewRecord();//活跃度统计
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({ title: '加载中...' })
    app.Api.get('/sell-promise/view', options).then(response => {
      wx.hideLoading();
      const {code, data, msg} = response;
      if (code == 200) {
        Object.assign(data, { showPage: true });
        this.setData(data);
      } else {
        this.setData({ showPage: true });
      }
    });
  },

  navigateTo: function (e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },

  phoneCall: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.advisor_tel || this.data.sale_tel
    })
  }
})