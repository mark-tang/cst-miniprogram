import Api from '../../../utils/api.js'

//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    payBtnText: '支付订单',
    hasSend: false,
    adressIndex: 0,
    itemsDemo: [
      { methods: '1', value: '微信支付', checked: false },
      { methods: '2', value: '余额支付', checked: false },
      { methods: '3', value: '积分兑换', checked: false },
    ],
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    var self = this;
    var listData = wx.getStorageSync('orderList');
    //计算合计总价
    console.log(listData)
    var totalMoney = 0;
    for (var i in listData) {
      totalMoney = totalMoney + (listData[i].num * listData[i].now_price)
      listData[i].imgUrl = typeof (listData[i].image) == 'string' ? listData[i].image : listData[i].image[0]
      if (listData[i].express_desc == '寄送') {
        self.setData({
          hasSend: true
        })
      }
    }

    this.setData({
      listData: listData,
      totalMoney: totalMoney.toFixed(2),
      isTuan: options.istuan,
      isJoin: options.join
    })
    //收货信息
    wx.showLoading({ title: '加载中...' })
    Api.authPost('/mall/address/list', {}, function (res) {
      var receiveData = res.data
      self.setData({
        receiveData: receiveData,
        showPage: true
      })
    })
    //支付方式
    if (options.origin == 'shopcar') {
      self.setData({ methods: 1, items: [] })
    } else if (options.origin == 'detail') {
      if (options.join) {
        self.setData({ methods: 1, items: [] })
      } else if (options.istuan && options.istuan != 'undefined') {
        self.setData({ methods: 1, items: [] })
      } else {
        var items = [
          { methods: '1', value: '微信支付', checked: false },
          { methods: '2', value: '余额支付', checked: false },
          { methods: '3', value: '积分兑换', checked: false },
        ]
        var newItem = []
        var payment = listData[0].payment
        console.log(payment)
        for (var i in items) {
          for (var j in payment) {
            if (payment[j] == items[i].methods) {
              newItem.push(items[i])
            }
          }
        }
        //积分为0
        if (listData[0].integral == 0) {
          for (var i in newItem) {
            if (newItem[i].methods == 3) {
              newItem.splice(i, 1)
            }
          }
        }
        //单价为0
        console.log(newItem)
        if (listData[0].now_price == 0) {
          var nowItem = newItem
          for (var item in nowItem) {
            newItem[item].methods == 1 ? newItem.splice(item, 1) : ''
            newItem[item].methods == 2 ? newItem.splice(item, 1) : ''
          }
        }
        newItem[0].checked = true
        self.setData({
          methods: newItem[0].methods,
          items: newItem
        })
      }
    }
  },
  radioChange(e) {
    var value = e.detail.value
    this.setData({ methods: value })
  },
  //获取收货信息
  getAdressInfo() {
    var self = this;
    var id = self.data.receiveData[0] ? self.data.receiveData[0].address_id : ''
    var adressIndex = this.data.adressIndex
    wx.navigateTo({
      url: '../chose_receiving_info/chose_receiving_info?address_id=' + id + '&adressIndex=' + adressIndex,
    })
  },
  payMent(e) {
    if (!this.data.receiveData[0] && this.data.hasSend) {
      Api.Utils.toast('请添加收货信息')
      return
    }
    var self = this
    //参数拼接
    self.setData({ isPaying: true, payBtnText: '支付中...' })
    var receiveData = this.data.receiveData[0];
    var listData = this.data.listData;
    var methods = this.data.methods;
    var isTuan = (this.data.isTuan == 'undefined') || !this.data.isTuan ? false : true;
    var isJoin = this.data.isJoin ? this.data.isJoin : false;
    var goodsid = []
    var pnum = []
    for (var i in listData) {
      goodsid.push(listData[i].goods_id)
      pnum.push(listData[i].num)
    }
    var param;
    if (this.data.hasSend) {
      param = {
        'expressInfo[phone]': receiveData.tel,
        'expressInfo[name]': receiveData.name,
        'expressInfo[addressString]': receiveData.provice + receiveData.city + receiveData.counties + receiveData.detail_info,
        'method': methods,
        'goodsid': goodsid,
        'pnum': pnum,
        'formId': e.detail.formId,
      }
    } else {
      param = {
        'method': methods,
        'goodsid': goodsid,
        'pnum': pnum,
        'formId': e.detail.formId,
      }
    }

    console.log(isTuan)
    //isTuan ? param.gid = listData[0].tuan.id:''
    if (isTuan) {
      isJoin ? param.headid = isJoin : param.gid = listData[0].tuan.id
    }
    if (!methods) {
      Api.Utils.toast('商品未配置支付方式');
      self.setData({ isPaying: false, payBtnText: '支付订单' })
      return
    }
    Api.authPost('/mall/order/add-order', param, function (res) {
      //发起支付请求
      if (methods == 1) { //微信支付
        self.weChatPay(res.data.JSInfo, res.data.out_trade_no, res.data.gid)
      } else {
        wx.redirectTo({
          url: '../complete_order/complete_order',
        })
      }
    }, function (res) {
      //Api.Utils.toast(res.msg);
      //self.setData({ isPaying: false, payBtnText: '支付订单' })
      wx.showModal({
        title: '支付失败',
        content: '失败原因\n' + res.msg,
        cancelText: '返回',
        confirmText: '查看订单',
        success(res) {
          if (res.confirm) {
            wx.redirectTo({
              url: '../order_list/order_list'
            })
          } else if (res.cancel) {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    })
  },
  weChatPay(JSInfo, orderid, gid) {
    var self = this
    var isJoin = this.data.isJoin

    wx.requestPayment({
      'timeStamp': JSInfo.timeStamp,
      'nonceStr': JSInfo.nonceStr,
      'package': JSInfo.package,
      'signType': JSInfo.signType,
      'paySign': JSInfo.paySign,
      'success': function (res) {
        // Api.Utils.toast('支付成功!')
        if (self.data.isJoin) {
          wx.redirectTo({ url: '/pages/mall/tuan/tuan?fatherid=' + isJoin })
        } else if (self.data.isTuan && self.data.isTuan != 'undefined') {
          wx.redirectTo({ url: '/pages/mall/tuan/tuan?gid=' + gid })
        } else {
          wx.redirectTo({ url: '../complete_order/complete_order' })
        }
      },
      'fail': function (res) {
        if (!res.err_desc) {
          //用户取消支付
          wx.showModal({
            title: '支付失败',
            content: '用户取消此订单支付',
            cancelText: '返回',
            confirmText: '查看订单',
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '../order_detail_nopay/order_detail_nopay?orderid=' + orderid,
                })
              } else if (res.cancel) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })

          self.setData({ isPaying: false, payBtnText: '支付订单' })
        } else {
          //支付失败
          wx.showModal({
            title: '支付失败',
            content: '失败原因\n' + res.err_desc,
            cancelText: '返回',
            confirmText: '查看订单',
            success(res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '../order_detail_nopay/order_detail_nopay?orderid=' + orderid,
                })
              } else if (res.cancel) {
                wx.navigateBack({
                  delta: 1
                })
              }
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
