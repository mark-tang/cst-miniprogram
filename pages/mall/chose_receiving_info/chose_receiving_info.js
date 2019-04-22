import Api from '../../../utils/api.js'

//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    items:[
      { methods: '1', value: '微信支付', checked: false },
      { methods: '2', value: '余额支付', checked: false },
      { methods: '3', value: '积分兑换', checked: false },
    ]
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    var self = this;
    this.setData({ options: options})
    //self.addReceivingInfo()
  },
  onShow(){
    this.queryData()
  },
  queryData(){
    wx.showLoading({ title: '加载中...' })
    var self = this
    var id = this.data.options.address_id
    Api.authPost('/mall/address/list', {}, function (res) {
      var receiveData = res.data;
      if(receiveData.length >0){
        // for (var i in receiveData) {
        //   if ((id || receiveData[0].address_id) == receiveData[i].address_id) {
        //     receiveData[i].isSelected = false
        //   }
        // }
        var adressIndex = self.options.adressIndex ;
        if (adressIndex != 0){
          receiveData[adressIndex].isSelected = true;
        }
        
        self.setData({
          receiveData: receiveData,
          showPage: true,
        })
      }else{
        self.setData({
          showPage:true,
          showEmpty:true,
        })
      }
      
    })
  },
  wxAdress(){
    console.log(123)
    var self = this
    wx.chooseAddress({
      success: function (res) {
       Api.authPost('/mall/address/edit', {
         name: res.userName,
         tel: res.telNumber,
         provice: res.provinceName,
         city: res.cityName,
         counties: res.countyName,
         detail_info: res.detailInfo,
         nationalCode: res.nationalCode
       }, function (res) {
         self.queryData()
         //Api.Utils.toPrepageData({ receiveData: receiveData })
         var receiveData = self.data.receiveData;
         //receiveData[0].isSelected = true;
         self.setData({ showEmpty: false, receiveData: receiveData});
       })
      },fail:function(res){
        console.log('fail')
      }
    })
  },
  addAdress(){
    wx.navigateTo({
      url: '../receive_info/receive_info',
    })
  },
  editAdress(e){
    var self = this
    var index = e.currentTarget.dataset.index;
    var addressid = e.currentTarget.dataset.addressid;
    var receiveData = this.data.receiveData
    console.log(addressid)
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (res) {
        if (res.tapIndex == 0){
          Api.authPost('/mall/address/del',{
            address_id: addressid
          },function(result){
            if (result.code == 200){
              receiveData.splice(index,1)
              self.setData({
                receiveData: receiveData
              })
              wx.showToast({
                title: '删除成功',
              })
            }
          })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })


  },
  choseAdress(e){
    var index = e.currentTarget.dataset.index;
    var addressid = e.currentTarget.dataset.addressid;

    var receiveData = this.data.receiveData;
    for (var i in receiveData){
      receiveData[i].isSelected = false
    }
    
    receiveData[index].isSelected = true;
    this.setData({ receiveData: receiveData})
    receiveData.unshift(receiveData[index])
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({ receiveData: receiveData,adressIndex: index})
    wx.navigateBack({ delta: 1 })
  },
  radioChange(e){
    var value = e.detail.value
    this.setData({methods: value})
  },
  //获取收货信息
  getAdressInfo(){
    var self  = this;
    wx.chooseAddress({
      success: function (res) {
       self.setData({
         adressInfo:res
       })
      }
    })
  },
  navigateTo(e){
    Api.Utils.href(e);
  }
})
