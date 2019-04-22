import Api from "../../../utils/api.js";
var utils = require('../../../utils/util.js');
var app = getApp()
Page({
  data: {
    showPage: false,
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
    wx.showLoading({
      title: '加载中...',
    })
    this.getDateList(options.activeDate, options.activeTitle, options.fullDate)
  },
  // 获取日期列表
  getDateList(activeDate, activeTitle, fullDate) {
    let self = this
    Api.authGet('/yangxiu/get-date-list', {}, function (res) {
      self.setData({
        showPage: true,
        dateList: res.data,
        activeDate: Number(activeDate) || res.data[0].date_value,
        activeTitle: activeTitle,
        fullDate: fullDate || res.data[0].full_date
      })
      self.getDayTime(Number(activeDate) || res.data[0].date_value)
    })
  },
  // 获取时间段
  getDayTime(day) {
    let self = this
    wx.showLoading({
      title: '加载中...',
    })
    Api.authGet('/yangxiu/get-day-time-config', {
      day: day
    }, function (res) {
      wx.hideLoading()
      self.setData({
        timeList: res.data.time_list
      })
    })
  },
  // 点击日期处理
  dateHandler(e) {
    let day = e.currentTarget.dataset.value
    let fullDate = e.currentTarget.dataset.full_date
    if (this.data.activeDate == day) return
    this.setData({
      activeDate: day,
      fullDate: fullDate,
      activeTitle: '',
    })
    this.getDayTime(day)
  },
  // 点击时间处理
  timeHandler(e) {
    let data = e.currentTarget.dataset.data
    console.log(data)
    if (data.disabled == 1) {
      utils.toast('此时段不可预约')
      return
    } else if (data.is_full == 1) {
      utils.toast('此时段已预约满')
      return
    }
    this.setData({
      activeTitle: data.title,
      discountContent: data.content
    })
    console.log(data)
  },
  confirm() {
    if (!this.data.activeTitle){
      utils.toast('请选择养修时段')
      return
    }
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 2];
    currPage.setData({
      timeToStore: [this.data.fullDate, this.data.activeTitle].join(' '),
      isChosedTime: true,
      childFullDate: this.data.fullDate,
      childActiveDate: this.data.activeDate,
      childActiveTitle: this.data.activeTitle,
      discountContent: this.data.discountContent
    })
    wx.navigateBack()
  }
})