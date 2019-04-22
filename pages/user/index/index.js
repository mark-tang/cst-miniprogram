import Api from "../../../utils/api.js"
//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    showEmpty:false,
    showPage:false,
    host: Api.config.host
  },
  onLoad (){
    app.viewRecord();//活跃度统计
    app.viewRecord();//活跃度统计
    this.queryData()
  },
  queryData(type) {
    var self = this;
    Api.authPost('/active/index', {}, function (res, header) {
      let nowTime = (new Date(header.Date)).getTime(); // 服务器当前时间
      nowTime = Math.ceil(nowTime * 0.001);
      let gameList = res.data;
      if (gameList.length < 1) {
        self.setData({
          showPage:true,
          showEmpty:true
        })
        return
      }
      setInterval(() => {
        handleData();
        self.setData({
          gameList: gameList,
          showPage: true
        })
        nowTime++
      }, 1000)
      function handleData() {
        for (let i in gameList) {
          // 捡钱活动类型区分
          if (gameList[i].category_sub_type == 1) {
            gameList[i].img = Api.config.host + '/images/cover-draw.png';
          } else if (gameList[i].category_sub_type == 2){
            gameList[i].img = Api.config.host + '/images/cover-egg.png';
          }

          /*
          * 活动时间类型：
          *   isForever => 永久有效
          *   notBegin  => 未开始 
          *   isBegin   => 进行中
          *   isEnd     => 已结束
          */
          let endTime = gameList[i].endtime_timestamp;
          let beginTime = gameList[i].releasetime_timestamp;

          // beginTime = 1514873820;
          // endTime = 1515045120;

          gameList[i].timeType = 'isBegin';
          if (endTime == 0) {
            gameList[i].timeType = 'isForever';
          } else if (nowTime >= endTime) {
            gameList[i].timeType = 'isEnd';
          } else if (beginTime >= nowTime) {
            gameList[i].timeType = 'notBegin';
            //计算开始时间倒计时
            let diffTime = beginTime - nowTime;
            gameList[i].day = Math.floor(diffTime / 86400);
            gameList[i].hour = self.formatNumber(Math.floor(diffTime % 86400 / 3600));
            gameList[i].minute = self.formatNumber(Math.floor(diffTime % 3600 / 60))
            gameList[i].second = self.formatNumber((diffTime % 60).toFixed(0));
          } else{
            //计算结束时间倒计时
            let diffTime = endTime - nowTime;
            gameList[i].day = Math.floor(diffTime / 86400);
            gameList[i].hour = self.formatNumber(Math.floor(diffTime% 86400 / 3600));
            gameList[i].minute = self.formatNumber(Math.floor(diffTime % 3600 / 60))
            gameList[i].second = self.formatNumber((diffTime % 60).toFixed(0));
          }
        }
      }
      wx.hideLoading()
    })
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  showVersion(){
    Api.Utils.toast('版本：'+Api.config.version)
  },
  goDetail(e){
    let params = e.currentTarget.dataset;
    console.log(params)
    if (params.timetype == 'notBegin'){
      Api.Utils.toast('活动未开始,不要心急哦！');
      return
    } else if (params.timetype == 'isEnd'){
      Api.Utils.toast('活动已结束，您来晚了！');
      return
    }
    // params.id = 904
    // params.type =3
    let url;
    console.log(params)
    if (params.sub == 1){
      url = '../lottery_draw/lottery_draw'
    } else if (params.sub == 2){
      url = '../lottery_golden_egg/lottery_golden_egg'
    }else{
      url = '../jike/index/index'
    }
    wx.navigateTo({
      url: `${url}?id=${params.id}&title=${params.title}&type=${params.type}`
    })

  },
  navigateTo (e){
    Api.Utils.href(e);
  },
  onPullDownRefresh(){
    this.queryData()
  }
})
