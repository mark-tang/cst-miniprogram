var utils = require("../../../utils/util.js");
import Api from "../../../utils/api.js";
var QQMapWX = require("../../../utils/qqmap-wx-jssdk.js");
var qqmapsdk;
var app = getApp()
Page({
  data:{
    locationInfo:'',
    loctionText:'正在定位...',
    num1: { name: '24小时救援电话', num: '13658998899' },
    num2: { name: '厂商服务热线', num: '96688' },
    TelIndex:1,
    newLatitude:'22.541939',
    newLongitude:'113.954025',
    isLoc:false,
    isLocText:false,
    name:'',
  },
  onLoad (){
    app.viewRecord();//活跃度统计
    qqmapsdk = new QQMapWX({
      key: 'LYPBZ-F4AKP-DE6DG-LNMSY-MXYRK-77FU7'
    });
    
    this.queryData()
  },
  queryData (){
    var self = this;
    Api.authGet('/support/index',{},function(res){
      var res = res.data;
      var obj = [];
      var baoxian = res.baoxian;
      for (var i in baoxian){
        var info = baoxian[i].name + ' ' + baoxian[i].tel;
        obj.push(info);
      }
      self.setData({
        orginName:res.name,
        orginPhone:res.phone,
        num1: { num: res.support_phone},
        num2: { num: res.factory_phone},
        baoxian: baoxian,
        insurer: obj
      })
      wx.setStorage({
        key: 'helpTel',
        data: res.support_phone,
      })
      var hasAdmin = '';
      res.has_admin == 0 ? hasAdmin = false : hasAdmin = true

      self.setData({
        hasAdmin : hasAdmin
      })
    })
    Api.au
  },
  onHide (){
    wx.hideLoading()
  },
  onReady: function (e) {
    var self = this;
    //实例化地图控件
    this.mapCtx = wx.createMapContext('myMap');
    //设置坐标点位置
    this.setControlsPoi()
    //初始获取用户位置
    this.getLoction(false);
    //循环出picker数据
    var num3Arr = this.data.num3Arr;
    
  },
  //定位
  getLoction(isReload){
    var self = this;
    //wx.showLoading({ title: '定位中..' })
    app.getLocationInfo(function (res) {
      self.setData({
        newLatitude: res.latitude,
        newLongitude: res.longitude,
        isLoc:true,
      })
      self.searchLoc(res.latitude, res.longitude) //地址解析
      self.moveToLocation();
      
    },isReload)
  },
  //救援表单提交
  submitForm(e) {
    
    var self = this;
    var phone = e.detail.value.phone;
    var name = e.detail.value.name;
    if(!phone) {
      utils.toast('请填写手机号码')
    } else if (!utils.isMobile(phone)) {
      utils.toast('请填写正确的号码')
    } else if (!self.data.isLoc) { 
      utils.toast('正在获取定位信息')
    } else if (!self.data.isLocText) { 
      utils.toast('未获取到位置信息')
    } else {
      wx.showLoading({
        title: '呼叫救援中..',
        mask: true,
      })
      this.setData({ isDisable: true })
      Api.authPost('/support/send-support',{
        name:'车主名',
        phone: phone,
        address: self.data.loctionText,
        long: self.data.newLongitude,
        lati: self.data.newLatitude,
        formId: e.detail.formId,
      },function(res){
        wx.showLoading({
          title: '呼叫救援中..',
          mask:true,
        })
        wx.setStorage({
          key: 'helpId',
          data: res.data.id,
        })

        setTimeout(function () {
          self.setData({ isDisable: false })
          wx.redirectTo({
            url: '../road_help_wait/road_help_wait',
          })
        },500)
      })

    }
  },
  //重新定位
  controlTap (e){
    var id = e.controlId;
    if(id == 2){
      this.getLoction(true);
    }
  },
  //切换电话
  changeNum(e){
    var index = e.detail.value;
    var self = this;
    self.setData({
      TelIndex: parseInt(index)+1
    })
  },
  //拨打电话
  callNum(e){
    var num = e.currentTarget.dataset.num;
    wx.makePhoneCall({
      phoneNumber: num
    })
  },
  //获取设备信息，设置controls的位置为Map中心
  //controls[id=1]为中心定位参考坐标
  //controls[id=2]为定位按钮
  setControlsPoi(){
    var self = this; 
    app.getSystemInfo(function(res){
      self.setData({
        controls: [{
          id: 1,
          iconPath: '../../../images/center-loc.png',
          position: {
            left: res.windowWidth / 2 - 15,
            top: 150 - 26,
            width: 30,
            height: 30
          },
          clickable: false
        }, {
          id: 2,
          iconPath: '../../../images/relocation.png',
          position: {
            left: 20,
            top: 240,
            width: 40,
            height: 40
          },
          clickable: true
        }]
      })
    },function(res){
      console.log(res)
    })
  },
  //移动地图
  regionchange(e) {
    var self = this;
    var type = e.type
    if (type == 'end'){
      self.setData({
        loctionText: "定位中..."
      })           
      self.getCenterLocation(function(res){
        self.searchLoc(res.latitude, res.longitude) //地址解析
      },function(){
        
      });
    }
  },
  //获取地图中心点的坐标
  getCenterLocation: function (cb,comlpete) {
    var self = this;
    this.mapCtx.getCenterLocation({
      success: function (res) {
        cb(res)
      },fail:function(res){
      }, complete:function(){
        comlpete()
      }
    })
  },
  //腾讯地图API逆地址解析[API] http://lbs.qq.com/qqmap_wx_jssdk/method-reverseGeocoder.html
  searchLoc(latitude, longitude){
    var self = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {       
        self.setData({
          loctionText: res.result.formatted_addresses.recommend, //经过腾讯地图优化过的描述方式，更具人性化特点
          isLocText:true,
        })
        wx.hideLoading()
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  //移动定位到屏幕中间
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  onShareAppMessage: function () {
    return {
      title: '道路救援',
      //path: '/pages/keep/reoad_help/reoad_help',
      path: '/pages/keep/index/index',
      success: function (res) {
        // 转发成功

      },
      fail: function (res) {

      }
    }
  }
})