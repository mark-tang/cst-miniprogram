import Api from '../../../utils/api.js'
var WxParse = require('../../../utils/wxParse/wxParse.js');
//index.js
//获取应用实例
var app = getApp()
var detailTimer
Page({
  data: {
    isToCar: false,
    shopcarCount: 0,
    count: {
      num: 1,
      isMinDis: true
    },
    showCount: false,
    showCount2: false,
    showCount3: false,
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    goodsInfoTest: {
      'name': '2017新款汽车座椅皮套居家旅行必备良品震撼上市旅行必备良品震撼上市旅行必备良品震撼上市旅行必备良品震撼上市',
      'type': 1,
      'price': '240',
      'orginPrice': '320',
      'endTime': '1501066800',
    },
    TabTitle: ['商品详情', '购买须知', '评价', '推荐'],
    tabIndex: 0,
    detailData: {
      msg: '商品详情-内容',
    },
    noticeData: {
      msg: '购买须知-内容',
    },
    evaluateData: {
      msg: '暂无评价',
    },
    recommendData: {
      msg: '暂无推荐',
    },

  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    var self = this;
    wx.showLoading({ title: '加载中...' })
    this.setData({
      detailId: options.id,
    })
    //获取商家信息
    app.getServiceInfo(function (serviceInfo) {
      self.setData({ serviceInfo: serviceInfo })
    })
  },
  onShow() {
    var self = this;
    self.queryData(this.data.detailId)
    //获取购物车数量
    app.getShopcarCount(function (shopcarCount) {
      self.setData({ shopcarCount: shopcarCount })
    })
  },
  countPicker() {
    var showCount = this.data.showCount || false
    this.setData({
      showCount: !showCount
    })
  },
  countPicker2() {
    var showCount2 = this.data.showCount2 || false
    this.setData({
      showCount2: !showCount2
    })
  },
  countPicker3() {
    var showCount3 = this.data.showCount3 || false
    this.setData({
      showCount3: !showCount3
    })
  },
  buyTuan(e) {
    var istuan = e.currentTarget.dataset.istuan;
    this.setData({ showCount2: false })
    var goodsInfo = this.data.goodsInfo;
    goodsInfo.num = this.data.count.num;
    goodsInfo.now_price = goodsInfo.tuan.groups_price;
    var data = []
    data.push(goodsInfo)
    wx.setStorage({
      key: 'orderList',
      data: data,
    })
    wx.navigateTo({
      url: '/pages/mall/confirm_order/confirm_order?origin=detail&istuan=' + istuan,
    })
  },
  buy2(e) {
    var istuan = e.currentTarget.dataset.istuan;
    this.setData({ showCount2: false })
    var goodsInfo = this.data.goodsInfo;
    goodsInfo.num = this.data.count.num;
    //goodsInfo.now_price = goodsInfo.old_price;
    var data = []
    data.push(goodsInfo)
    wx.setStorage({
      key: 'orderList',
      data: data,
    })
    wx.navigateTo({
      url: '/pages/mall/confirm_order/confirm_order?origin=detail&istuan=' + istuan,
    })
  },
  buy(e) {
    var istuan = e.currentTarget.dataset.istuan
    this.setData({ showCount: false })
    var goodsInfo = this.data.goodsInfo;
    goodsInfo.num = this.data.count.num;
    var data = []
    data.push(goodsInfo)
    wx.setStorage({
      key: 'orderList',
      data: data,
    })

    wx.navigateTo({
      url: '/pages/mall/confirm_order/confirm_order?origin=detail&istuan=' + istuan,
    })
  },
  changeQuentity(event) {
    var type = event.currentTarget.dataset.type;
    var count = this.data.count;
    //添加
    if (type == 'add') {
      var maxnum = event.currentTarget.dataset.maxnum;
      count.isMinDis = false;
      if (count.num == maxnum) {
        count.isMaxDis = true;
        Api.Utils.toast('亲，该宝贝不能购买更多哦！')
      } else {
        count.num++;
      }
      //减少   
    } else if (type == 'subtract') {
      count.isMaxDis = false;
      if (count.num == 1) {
        count.isMinDis = true
      } else {
        count.num--;
      }
    }
    this.setData({
      count: count
    })
  },
  tuanDetail(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../tuan/tuan?id=' + id,
    })
  },
  queryData(id) {
    var self = this;
    clearInterval(detailTimer)
    Api.authPost('/v2/pro/detail', { id: id }, function (res) {
      var goodsInfo = res.data;
      var detail = res.data.detail || '没有更多商品详情';
      var idx = detail.indexOf("产品描述")
      // if(idx>0){

      // }
      var v = detail.substr(0, idx);
      var v1 = detail.substr(idx);
      var pack_details = res.data.pack_details;
      var pack_detail_txt = '';
      if (pack_details.hasOwnProperty("1")) {
        pack_detail_txt += '<div style="width:25%;float:left;background:#39d495;color:#fff;text-align:center;line-height:30px">套餐内容</div><div style="width:25%;float:left;background:#39d495;color:#fff;text-align:center;line-height:30px">单价</div><div style="width:25%;float:left;background:#39d495;color:#fff;text-align:center;line-height:30px">数量规格</div><div style="width:25%;float:left;background:#39d495;color:#fff;text-align:center;line-height:30px">小计</div>';
        for (var item in pack_details) {
          pack_detail_txt += '<div style="width:25%;float:left;text-align:center;box-sizing: border-box;line-height:26px;box">' + pack_details[item].sub_name + '</div>' + '<div style="width:25%;float:left;box-sizing: border-box;text-align:center;line-height:26px">' + pack_details[item].unit_price + '</div>' + '<div style="width:25%;float:left;text-align:center;box-sizing: border-box;line-height:26px">' + pack_details[item].standard + '</div>' + '<div style="width:25%;float:left;text-align:center;box-sizing: border-box;line-height:26px">' + pack_details[item].sub_total + '</div>'
        }
      }


      if (idx >= 0) {
        detail = '<p>' + v1 + '</p>' + pack_detail_txt + v;
      } else {
        detail = pack_detail_txt + detail;
      }
      console.log(detail)

      WxParse.wxParse('detail', 'html', detail, self, 10);

      //是否能加入购物车
      var payMent = res.data.payment
      for (var i in payMent) {
        if (payMent[i] == 1) {
          self.setData({ isToCar: true })
        } else if (payMent[i] == 3) {
          self.setData({ isInteg: true })
        }
      }
      //type值  0:普通  1：拼团  2：限购  3：抢购
      goodsInfo.type = (goodsInfo.once_num && goodsInfo.once_num > 0) ? 2 : 0
      goodsInfo.type = (goodsInfo.over_time && goodsInfo.over_time > 0) ? 3 : goodsInfo.type
      goodsInfo.type = goodsInfo.tuan.id ? 1 : goodsInfo.type
      //销售进度
      var totalNum = parseInt(goodsInfo.sell_num) + parseInt(goodsInfo.max_num)
      goodsInfo.process = Math.round((goodsInfo.sell_num / totalNum) * 100)
      self.setData({ showPage: true })
      //是否显示天数
      function renderData() {
        //活动状态管理 timeStatus = 0:未开始  1：进行中  2：已结束
        var nowTime = Math.round(new Date().getTime() / 1000);
        goodsInfo.timeStatus = 1
        var diffBeginTime, diffEndTime
        if (goodsInfo.type == 1) {
          diffBeginTime = goodsInfo.tuan.startTime - nowTime
          diffEndTime = goodsInfo.tuan.endTime - nowTime
        } else if (goodsInfo.type == 3) {
          diffBeginTime = goodsInfo.begin_time - nowTime
          diffEndTime = goodsInfo.over_time - nowTime
        }

        if (goodsInfo.type == 1 || goodsInfo.type == 3) {
          if (diffBeginTime < 0 && diffEndTime > 0) {
            goodsInfo.timeStatus = 1
            //计算倒计时           
            var diffTime = {};

            diffTime.day = Math.floor(diffEndTime / 86400)
            var dayRemain = diffEndTime % 86400
            diffTime.hour = self.formatNumber(Math.floor(dayRemain / 3600))
            var hourRemain = diffEndTime % 3600
            diffTime.minute = self.formatNumber(Math.floor(hourRemain / 60))
            diffTime.second = self.formatNumber((diffEndTime % 60).toFixed(0));
            (diffEndTime / 86400) > 1 ? diffTime.showDay = true : diffTime.showDay
            self.setData({
              diffTime: diffTime,
            })
          } else if (diffBeginTime >= 0) {
            goodsInfo.timeStatus = 0
            //计算倒计时           
            var diffTimeBefore = {};

            diffTimeBefore.day = Math.floor(diffBeginTime / 86400)
            var dayRemain = diffBeginTime % 86400
            diffTimeBefore.hour = self.formatNumber(Math.floor(dayRemain / 3600))
            var hourRemain = diffBeginTime % 3600
            diffTimeBefore.minute = self.formatNumber(Math.floor(hourRemain / 60))
            diffTimeBefore.second = self.formatNumber((diffBeginTime % 60).toFixed(0));
            (diffBeginTime / 86400) > 1 ? diffTimeBefore.showDay = true : diffTimeBefore.showDay
            self.setData({
              diffTimeBefore: diffTimeBefore,
            })
          } else if (diffEndTime <= 0) {
            goodsInfo.timeStatus = 2
          }
        }
        self.setData({
          goodsInfo: goodsInfo,  //
        })
        if (goodsInfo.timeStatus == 0 || goodsInfo.timeStatus == 2) {
          self.setData({ isToCar: false })
        }
        console.log(goodsInfo.timeStatus)
      }
      renderData()
      detailTimer = setInterval(function () {
        renderData()
      }, 1000)
    }, function (error) {
      Api.Utils.toast(error.msg)
      if (error.msg == '该商品已下架') {
        setTimeout(function () {
          wx.navigateTo({
            url: '../index/index'
          })
        }, 1500)
      }
    })
  },
  onHide() {
    clearInterval(detailTimer)
  },
  //计算倒计时
  calcTime(nowDate, endTime) {
    var self = this;
    var diffTime = {};
    diffTime.showDay = false
    var diffDate = endTime - nowDate
    diffTime.day = Math.floor(diffDate / 86400)
    var dayRemain = diffDate % 86400
    diffTime.hour = self.formatNumber(Math.floor(dayRemain / 3600))
    var hourRemain = diffDate % 3600
    diffTime.minute = self.formatNumber(Math.floor(hourRemain / 60))
    diffTime.second = self.formatNumber((diffDate % 60).toFixed(0));

    (diffDate / 86400) > 1 ? diffTime.showDay = true : diffTime.showDay
    self.setData({
      diffTime: diffTime,
    })
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  switchTab(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      tabIndex: index
    })
  },
  previewImage(e) {
    var index = e.currentTarget.dataset.index;
    var imgUrl = this.data.goodsInfo.image;
    wx.previewImage({
      current: imgUrl[index], // 当前显示图片的http链接
      urls: imgUrl // 需要预览的图片http链接列表
    })
  },
  addCar() {
    //wx.showLoading({title:'加载中...'})
    var self = this
    var totalNum = this.data.totalNum;
    Api.authPost('/mall/cart/add', {
      id: self.data.detailId,
      num: 1
    }, function (res) {
      if (res.code == 200) {
        wx.showToast({ title: '添加成功' })
        var nowShopcarCount = self.data.shopcarCount + 1
        self.setData({
          shopcarCount: nowShopcarCount
        })
        app.refreshShopcarCount(nowShopcarCount)
      } else {
        Api.Utils.toast('添加失败')
      }
    })
  },
  openLoc() {
    var self = this;
    var serviceInfo = this.data.serviceInfo;
    wx.openLocation({
      latitude: Number(serviceInfo.latitude),
      longitude: Number(serviceInfo.longitude),
      scale: 28,
      name: serviceInfo.fullName,
      address: serviceInfo.address
    })
  },
  scroll(e) {
    if (e.detail.scrollTop > 350) {
      this.setData({
        showBackTop: true,
        nowScrollTop: e.detail.scrollTop
      })
    } else {
      this.setData({
        showBackTop: false
      })
    }
  },
  goTop() {
    var self = this
    var scrollTop = this.data.nowScrollTop;
    self.setData({
      scrollTop: 0
    })
  },
  //跳转推荐信息
  recomdQuery(e) {
    wx.showLoading({ title: '加载中...' })
    var id = e.currentTarget.dataset.id;
    this.queryData(id)
    this.setData({
      detailId: id,
      scrollTop: 0
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  },
  callNum(e) {
    var num = e.currentTarget.dataset.num
    wx.makePhoneCall({
      phoneNumber: num,
    })
  },
  onShareAppMessage: function () {
    return {
      title: this.data.goodsInfo.name,
      path: '/pages/mall/detail/detail?id=' + this.data.detailId
    }
  }
})
