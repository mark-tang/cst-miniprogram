import Api from '../../../utils/api.js'

//index.js
//获取应用实例
var app = getApp()
var timer
Page({
  data: {
    showPage:false,
    refundMoney:0.00,
    orderGoodsid:[],
    reasons: [
      { name: '预约不上' },
      { name: '不太满意' },
      { name: '朋友/网上评价不太好' },
      { name: '买多了/买错了' },
      { name: '计划有变，没时间消费'},
      { name: '其它原因' },
    ]
  },
  onHide(){
    //clearInterval(timer)
  },
  onLoad(options){
    app.viewRecord();//活跃度统计
    wx.showLoading({title: '加载中...'})
    var self = this;
    self.queryData(options.orderid);
    self.setData({
      subid: options.subid
    })
  },
  queryData(orderid){
    var self = this;
    Api.authPost('/mall/order/order-info', { orderid: orderid }, function (res) {
      var subGoods = res.data.sub_goods;
      var orderGoodsid = []
      for (var i in subGoods){
        if (subGoods[i].goods_id == self.data.subid){
          var code = subGoods[i].code
          self.setData({
            code: code,
            singlePrice: subGoods[i].price
          })
        }
      }
      self.setData(res.data)
      self.setData({ showPage: true })
      var goodList = res.data.sub_goods
    }) 
  },
  bindFormSubmit(e){
    var self = this
    var textarea = e.detail.value.textarea;
    var orderGoodsid = self.data.orderGoodsid;
    var formId = e.detail.formId;
    var refund_reason = self.data.refundReason
    if (orderGoodsid.length == 0){
      Api.Utils.toast('请选择要退款的消费码')
    } else if (!refund_reason){
      Api.Utils.toast('请选择或填写退款理由')
    }else{
      self.setData({ isSubmit: true })
      var param = {
        orderGoodsid: orderGoodsid,
        refund_reason: refund_reason,
        formId: formId
      }
      Api.authPost('/mall/order/apply-for-refund', param,function(res){
        if(res.code == 200){
          wx.showToast({title: '申请退款成功!',mask:true})
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
            })
          },1500)
        }
      })
    }
    
  },
  checkboxChange(e){
    var self = this
    var value = e.detail.value;
    self.setData({
      orderGoodsid: value,
      refundMoney: value.length * self.data.singlePrice
    })
  },
  radioChange(e){
    var self = this;
    var value = e.detail.value;
    var reason = this.data.reasons
    this.setData({
      refundReason:reason[value].name
    })
    if(value == 5){
      self.setData({ showTextArea:true})
    }else{
      self.setData({ showTextArea: false })
    }
  },
  navigateTo(e){
    Api.Utils.href(e);
  }
})
