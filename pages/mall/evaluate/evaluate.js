import Api from '../../../utils/api.js'

//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    starValue: 0,
    isAnonymous:true,
  },
  onLoad(options){
    app.viewRecord();//活跃度统计
    wx.showLoading({title: '加载中...'})
    var self = this
    var orderid = options.orderid
    self.queryData(orderid)
    self.setData({
      orderid: orderid,
      subid:options.subid,
      orderIndex:options.index
    })
  },
  queryData(orderid){
    var self = this
    Api.authPost('/mall/order/order-comment',{
      out_trade_no:orderid
    },function(res){
      self.setData(res.data)

      var commentExample = res.data.commentExample
      var fastEva = []
      for (var i in commentExample){
        fastEva.push({ text: commentExample[i],isSelect:false})
      }
      self.setData({ fastEva: fastEva, showPage:true})
    })
  },
  bindFormSubmit(e){
    var self = this
    var textarea = e.detail.value.textarea;
    var fastEva = self.data.fastEva
    var param = {}
    for (var i in fastEva){
      if (fastEva[i].isSelect){
        textarea == '' ? textarea += fastEva[i].text+' ':textarea += ' '+fastEva[i].text
      }
    }
    param = {
      out_trade_no: self.data.orderid,
      sub_order_id: self.data.subid,
      is_anonymous: self.data.isAnonymous?1:0,
      content: textarea,
      score: self.data.starValue+1
    }
    if (param.content){
      Api.authPost('/mall/order/add-comment', param, function (res) {
        if (res.code == 200) {
          wx.showToast({ title: '评价成功！', mask: true })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    }else{
      Api.Utils.toast('请输入或选择评价内容')
    }

    
  },
  //星级评价
  starTap(e){
    var index = e.currentTarget.dataset.index;
    this.setData({
      starValue:index
    })
  },
  //快速评价
  fastEva(e) {
    var index = e.currentTarget.dataset.index;
    var fastEva = this.data.fastEva;
    fastEva[index].isSelect = !fastEva[index].isSelect;
    this.setData({
      fastEva: fastEva
    })
  },
  //是否匿名
  tapAnonymous() {
    var isAnonymous = this.data.isAnonymous;
    this.setData({ isAnonymous: !isAnonymous })
  },
  navigateTo(e){
    Api.Utils.href(e);
  }
})
