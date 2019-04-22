import Api from '../../../utils/api.js'
 
//index.js
//获取应用实例
var app = getApp()
var indexTimer
Page({
  data: {
    showPage:false,
  },
  onLoad(){
    this.queryData()
  },
  onShow(){
    app.viewRecord();//活跃度统计
    let self = this;
    Api.authPost('/common/mall-status', {}, function (res) {
      wx.setStorage({
        key: "hasMall",
        data: res.data.mall_status == 1,
      })
      self.setData({
        hasMall: res.data.mall_status == 1
      })
    })
    
  },
  queryData(){
    var self = this;
    Api.authPost('/mall/pro/index', {}, function (res) {
      app.initTabBar(); 
      var hotData = res.data.hot   //.slice(0, 4)
      var extendData = res.data.extend;
      for (var i in extendData){
        console.log(extendData[i])
        for(var j in extendData[i]){
          //type值  0:普通  1：拼团  2：限购  3：抢购
          extendData[i][j].type = (extendData[i][j].once_num && extendData[i][j].once_num > 0) ? 2 : 0
          extendData[i][j].type = (extendData[i][j].over_time && extendData[i][j].over_time > 0) ? 3 : extendData[i][j].type
      
          extendData[i][j].type = extendData[i][j].tuan.id ? 1 : extendData[i][j].type
        } 
      }
      
      self.setData({
        loopData: res.data.loop,
        extendData: extendData,
        marketingZone: res.data.marketingZone,
        
      })
      wx.stopPullDownRefresh()
      calcHot()
      indexTimer = setInterval(calcHot, 1000)
      function calcHot(){
        var nowTime = Math.round(new Date().getTime() / 1000);
        for (var i in hotData) {
          //type值  0:普通  1：拼团  2：限购  3：抢购
          hotData[i].type = (hotData[i].once_num && hotData[i].once_num > 0) ? 2 : 0
          hotData[i].type = (hotData[i].over_time && hotData[i].over_time > 0) ? 3 : hotData[i].type

          hotData[i].type = hotData[i].tuan.id ? 1 : hotData[i].type
          //销售进度
          var totalNum = parseInt(hotData[i].max_num) + parseInt(hotData[i].sell_num);
          hotData[i].process = Math.round((hotData[i].sell_num / totalNum) * 100);
          //是否显示天数
          hotData[i].showDay = false;
          //活动状态管理 timeStatus = 0:未开始  1：进行中  2：已结束
          hotData[i].timeStatus = 1
          var diffBeginTime, diffEndTime
          if (hotData[i].type == 1) {
            diffBeginTime = hotData[i].tuan.startTime - nowTime
            diffEndTime = hotData[i].tuan.endTime - nowTime
          } else if (hotData[i].type == 3) {
            diffBeginTime = hotData[i].begin_time - nowTime
            diffEndTime = hotData[i].over_time - nowTime
          }
          if (hotData[i].type == 1 || hotData[i].type == 3) {
            if (diffBeginTime < 0 && diffEndTime > 0) {
              hotData[i].timeStatus = 1
              //计算倒计时
              hotData[i].day = Math.floor(diffEndTime / 86400)
              var dayRemain = diffEndTime % 86400
              hotData[i].hour = self.formatNumber(Math.floor(dayRemain / 3600))
              var hourRemain = diffEndTime % 3600
              hotData[i].minute = self.formatNumber(Math.floor(hourRemain / 60))
              hotData[i].second = self.formatNumber((diffEndTime % 60).toFixed(0));
              (diffEndTime / 86400) > 1 ? hotData[i].showDay = true : hotData[i].showDay
            } else if (diffBeginTime >= 0) {
              hotData[i].timeStatus = 0
            } else if (diffEndTime <= 0) {
              hotData[i].timeStatus = 2
            }
          }

        }
        self.setData({
          hotData: hotData,  
          showPage: true,
        })
        //console.info('indexindexTimer is run')
      }
    })    
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  getScrollOffset: function () {
    wx.createSelectorQuery().selectViewport().scrollOffset(function (res) {
      res.id         // 节点的ID
      res.dataset    // 节点的dataset
      res.scrollLeft // 节点的水平滚动位置
      res.scrollTop  // 节点的竖直滚动位置
    }).exec()
  },
  scroll(e){
    if(e.detail.scrollTop > 350){
      this.setData({
        showBackTop: true,
        nowScrollTop: e.detail.scrollTop
      })
    }else{
      this.setData({
        showBackTop: false
      })
    }
  },
  goTop(){
    var self = this
    var scrollTop = this.data.nowScrollTop;
    var indexToptimer = setInterval(function () {
        if (scrollTop > 0) {
          scrollTop = scrollTop-20;
          
          self.setData({
            scrollTop: scrollTop
          })
        } else {
          clearInterval(indexToptimer)
        }
      }, 5)
  },
  navigateTo(e){
    Api.Utils.href(e);
  },
  onPullDownRefresh: function () {
    clearInterval(indexTimer)
    this.queryData();
  },
  onShareAppMessage: function () {
    return {
      title: '商城',
      path: '/pages/mall/index/index'
    }
  },
})
