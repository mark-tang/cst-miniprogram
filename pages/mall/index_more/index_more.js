import Api from '../../../utils/api.js'

//index.js
//获取应用实例
var app = getApp()
var moreTimer
Page({
  data: {
    showPage:false,
  },
  onHide(){
    //clearInterval(timer)
  },
  onLoad(options){
    app.viewRecord();//活跃度统计
    var self = this;
    wx.showLoading({title: '加载中...'})
    self.queryData(options.type)
  },
  queryData(type){
    var self = this;
    Api.authPost('/mall/pro/list',{
      page:1,
      type: type
    },function(res){
      //console.log(res)
      type == 0 ? self.renderHotData(res) : self.renderListData(res)
    })
  },
  renderHotData(res){
    var self = this;
    var hotData = res.data.list.data
    calcTime()
    moreTimer = setInterval(calcTime, 1000)
    function calcTime() {
      var nowTime = Math.round(new Date().getTime() / 1000);
      for (var i in hotData) {
        //type值  0:普通  1：拼团  2：限购  3：抢购
        hotData[i].type = (hotData[i].over_time && hotData[i].over_time > 0) ? 3 : 0
        hotData[i].type = (hotData[i].once_num && hotData[i].once_num > 0) ? 2 : hotData[i].type
        hotData[i].type = hotData[i].tuan.id ? 1 : hotData[i].type
        //销售进度
        var totalNum = parseInt(hotData[i].max_num) + parseInt(hotData[i].sell_num);
        hotData[i].process = Math.round((hotData[i].sell_num / totalNum) * 100)
        //是否显示天数
        hotData[i].showDay = false
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
        hotData: hotData,  //
        showPage: true,
      })
      console.info('indexTimer is run')
    }
  },
  renderListData(res){
    var self = this;
    self.setData({
      listData: res.data.list.data,
      showPage: true,
    })
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  scroll(e){
    if(e.detail.scrollTop > 200){
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
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  navigateTo(e){
    Api.Utils.href(e);
  },
  
})
