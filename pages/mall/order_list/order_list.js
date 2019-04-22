import Api from "../../../utils/api.js"

var app = getApp()
var orderPage = 1;
var orderPageCount = 1;
Page({
  data:{
    activeIndex:0,
    //orderTitle:['全部','待付款','待消费','退款单','待评价'],
    orderTitle:[
      { text: '全部', isLoad: false },
      { text: '待付款', isLoad: false },
      { text: '待消费', isLoad: false },
      { text: '退款单', isLoad: false },
      { text: '待评价', isLoad: false },
    ],
    cancelRenson:[
      { text: '地址写错了', value: '0' },
      { text: '我想重新拍', value: '1' },
      { text: '我不想买了', value: '2' },
      { text: '我要考虑一下', value: '3' },
      { text: '其它原因', value: '4' },
    ]
  },
  onLoad (options){
    wx.showLoading({ title: '加载中...'})
    var self = this;
    var type =  options.type || 0;
    this.setData({
      activeIndex:type
    })
    orderPage =1;
    self.getListData(this.data.activeIndex)
  },
  onShow(){
    app.viewRecord();//活跃度统计
    var self = this;
    
    var isRefreshOrder = wx.getStorageSync('isRefreshOrder') || false
    if (isRefreshOrder){
      this.setData({ orderList: [] })
      orderPage = 1
      self.getListData(this.data.activeIndex)
    }
    
  },
  onReachBottom(){
    this.getListData(this.data.activeIndex)
  },
  getListData(type){
    var self = this;
    if (orderPage <=orderPageCount){
      wx.showLoading({ title: '加载中...', mask: true})
      Api.authGet('/mall/order/list', {
        type: type,
        page: orderPage,
      }, function (res) {
        orderPageCount = res.data.list.page.page_count == 0 ? 1 : res.data.list.page.page_count
        var listData = res.data.list.data;
        for (var i in listData) {
          var goods = listData[i].sub_goods
          listData[i].totalMoney = 0
          listData[i].goodsCount = 0
          for (var j in goods) {
            listData[i].totalMoney += goods[j].num * goods[j].price
            listData[i].goodsCount++
          }
        }
        var orginData = self.data.orderList || [];
        self.setData({
          orderList: orginData.concat(listData),
        })
        orderPage++
        self.setData({ showPage: true, })
        wx.setStorage({
          key: 'isRefreshOrder',
          data: false,
        })
      })
    }else {
      orderPage == 1 ? '' : self.setData({ loadOver: true })
    }
    
    
  },
  switchTab(e){
    var self = this;
    var index = e.currentTarget.dataset.index;
    var orderTitle = this.data.orderTitle;
    orderTitle[index].isLoad = true;
    this.setData({
      activeIndex: index,
      orderTitle: orderTitle,
      orderList:[],
      loadOver:false,
    })
    orderPage = 1
    self.getListData(index)
  },
  reListData(index){
    var self = this;
    var listData = []
    listData = self.data.orderAll
    this.setData({
      orderList: listData
    })
  },
  //取消订单
  cancelOrder(e){
    var self = this
    var index = e.currentTarget.dataset.index;
    var orderList = this.data.orderList;
    var outTradeNo = e.currentTarget.dataset.id;
    Api.authPost('/mall/order/cancel', { out_trade_no: outTradeNo},function(res){
      if(res.code == 200){    
        console.log(index);
        console.log(orderList)
        orderList[index].order_status = 0;
        orderList[index].status_name = '已取消';
        self.setData({orderList: orderList})
        wx.showToast({
          title: '成功取消订单'
        })
      }
    },function(res){
      if(res.msg == null){
        Api.Utils.toast('取消订单失败，请联系客服')
      }else{
        Api.Utils.toast(res.msg)
      }
    })
  },
  //支付订单
  confirmOrder(e){
    var self = this
    var orderid = e.currentTarget.dataset.orderid;
    var index = e.currentTarget.dataset.index;
    var fromId = e.detail.formId;
    Api.authPost('/mall/order/re-payment',{
      orderId:orderid,
      fromId: fromId
    },function(res){
      if (res.data.appId){
        self.weChatPay(res.data,index,function(){
          var orderList = self.data.orderList;
          orderList[index].pay_status == 1 
          self.setData({ orderList: orderList })
        })
      }else if (res.code == 200){
        Api.Utils.toast('支付成功!');
        var orderList = self.data.orderList;
        orderList[index].pay_status = 1;
        orderList[index].status_name = '待消费';
        self.setData({ orderList: orderList });
      }
    })
  },
  toDetail(e){
    var self = this;
    var index = e.currentTarget.dataset.index;
    var order = self.data.orderList[index];
    var type

    if (order.order_status == 1 && order.pay_status == 0){
      type = 0
    } else if (order.use_status == 0 && order.pay_status == 1){
      type = 1
    } else if (order.order_status ==  0){
      type = 1
    } else if (order.pay_status == 1){
      type = 1
    } else if (order.pay_status == 2 || order.pay_status == 3){
      type = 1 
    }else{
      type = 1
    }
    var url = ''
    if(type == 0){
      url = '../order_detail_nopay/order_detail_nopay?orderid=' + order.out_trade_no
    } else if (type == 1) {
      url = '../order_detail_noconsume/order_detail_noconsume?orderid=' + order.out_trade_no
    } else if (type == 2) {
      url = '../refund_detail/refund_detail'
    } else if (type == 3) {
      url = '../order_detail_eva/order_detail_eva'
    }
    wx.navigateTo({
      url: url,
    })
  },
  //微信支付
  weChatPay(JSInfo, cb) {
    var self = this
    wx.requestPayment({
      'timeStamp': JSInfo.timeStamp,
      'nonceStr': JSInfo.nonceStr,
      'package': JSInfo.package,
      'signType': JSInfo.signType,
      'paySign': JSInfo.paySign,
      'success': function (res) {
        Api.Utils.toast('支付成功!');
        cb()
      },
      'fail': function (res) {
        if (!res.err_desc) {
          //用户取消支付
          Api.Utils.toast('用户取消支付')
        } else {
          //支付失败
          wx.showModal({
            title: '支付失败',
            content: '失败原因\n' + res.err_desc,
            showCancel: false,
            success(res) {
              self.setData({ isPaying: false, payBtnText: '支付订单' })
            }
          })

        }

      }
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  }
})