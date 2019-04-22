let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPage: false
  },
  onShow(){
    app.viewRecord();//活跃度统计 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    app.Api.get('/common/get-car-list', options).then(response => {
      const {code, data, msg} = response;
      if (code == 200) {
        Object.assign(data, {
          showPage: true
        })
        this.setData(data);
        console.log(data);
      } else {
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  onTap: function (e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 3];
    let data = Object.assign(
      { carInfo: e.currentTarget.dataset }, 
      { isCar: true }
    );
    
    prevPage.setData(data);
    wx.navigateBack({ delta: 2 })
  }
})