
import Api from "../../../utils/api.js"
//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    listData2:[
      {
        'shoping_cart_id':'21145145',
        'name':'2016新款汽车座椅皮套居家旅行必备良品震撼上市',
        'image':'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg',
        'type':1,
        'now_price':'100',
        'orginPrice':'320',
        'process':'34',
        'saledCount':50,
        'isSelected':true,
        'num':1,
        "max_num": 8,
        'isMinDis':true
      }
    ],
    isAll:false,
    isEdit:false,
    disabled:true,
    selectedCount:0,
  },
  onShow(){
    
  },
  onLoad(){
    app.viewRecord();//活跃度统计
    wx.showLoading({title: '加载中...'})
    var self = this;
    //var listData = this.data.listData;
    Api.authPost('/mall/cart/list',{},function(res){
      var listData = res.data.list.data.reverse()
      if (listData.length > 0){
        for (var i in listData) {
          listData[i].count == 1 ? listData[i].isMinDis = true : listData[i].isMinDis = false ;
          listData[i].count == listData[i].max_num ? listData[i].isMaxDis = true : listData[i].isMaxDis = false ;
          
          if (listData[i].max_num == 0 ){
            listData[i].isMinDis = true
            listData[i].isMaxDis = true
          } else if (listData[i].is_delete){
            listData[i].isMinDis = true
            listData[i].isMaxDis = true
          }else{
            listData[i].isSelected = true;
          }
        }
        self.setData({
          listData: listData,
          showPage: true,
        })
        self.calcMoney()
        self.isSelectAll()
        self.initQuentity()
        self.calcSelectedCount()
      }else{
        self.setData({ showPage: true,isEmpet: true })
      }
      
    })
  },
  //编辑状态
  edit(){
    var isEdit = this.data.isEdit;
    this.setData({
      isEdit: !isEdit
    })
  },
  toConfirm(){
    var listData = this.data.listData
    var orderList = []
    listData.forEach(function(item){
      if (item.isSelected){
        orderList.push(item)
      }
    })
    wx.setStorage({
      key: 'orderList',
      data: orderList,
    })
    
    wx.navigateTo({
      url: '/pages/mall/confirm_order/confirm_order?origin=shopcar',
    })
  }, 
  //删除商品
  del(event){
    var self = this;
    const index = event.currentTarget.dataset.index;
    const id = event.currentTarget.dataset.id;
    var listData = this.data.listData;
    wx.showModal({
      content: '确认要从购物车移除此商品吗？',
      confirmText:'删除',
      confirmColor:'#f24b4b',
      success:function(res){
        if(res.confirm){
          //删除列表数据
          listData.splice(index, 1);
          Api.authPost('/mall/cart/del',{
            cart_id: id
          },function(res){
            if(res.code == 200){
              self.setData({
                listData: listData,
                isEmpet: false,
              })
              console.log(listData.length)
              if (listData.length == 0) {
                self.setData({ isEmpet: true})
              }
              self.calcMoney()
              self.isSelectAll()
            }else{

            }
          })
          self.calcSelectedCount()
          self.ShopcarCount()
        }
      }
    })
  },
  //更新全局购物车数量
  ShopcarCount(){
    var shopcarCount = 0
    var listData = this.data.listData
    for (var i in listData) {
      shopcarCount = shopcarCount + listData[i].num
    }
    app.refreshShopcarCount(shopcarCount)
  },
  //选中单个商品
  selectGood(event){
    var self = this
    const index = event.currentTarget.dataset.index;
    var listData = this.data.listData;
    if (listData[index].max_num == 0){
      Api.Utils.toast('该商品库存不足')
    } else if (listData[index].is_delete){
      Api.Utils.toast('该商品已被删除，无法购买')
    }else{
      listData[index].isSelected = !listData[index].isSelected
      self.setData({
        listData: listData,
      })
      self.calcMoney()
      self.isSelectAll()
      self.calcSelectedCount()
    }
  },
  //全选
  selectAll() {
    var isAll = this.data.isAll;
    var listData = this.data.listData;
    if (isAll) { //全选
      for (var i in listData) {
        if (listData[i].max_num != 0 && !listData[i].is_delete){
          listData[i].isSelected = false;
        }
      }
    } else { //全取消
      for (var i in listData) {
        if (listData[i].max_num != 0 && !listData[i].is_delete) {
          listData[i].isSelected = true;
        }
      }
    }
    this.setData({ listData: listData, isAll: !isAll })
    this.calcMoney()
    this.calcSelectedCount()
  },
  //是否全部选中
  isSelectAll() {
    var temp = 0;
    var isAll = this.data.isAll;
    var listData = this.data.listData;
    for (var i in listData) {
      if (!listData[i].isSelected) {
        temp = 1
      }
    }
    if (temp == 0) {
      this.setData({ isAll: true })
    } else {
      this.setData({ isAll: false })
    }
  },
  //计算总金额
  calcMoney(){
    var totalMoney = 0;
    var listData = this.data.listData;
    for (var i in listData){
      if (listData[i].isSelected){
        totalMoney = totalMoney + listData[i].now_price * listData[i].num
      }
    }
    this.setData({
      totalMoney: totalMoney.toFixed(2),
    })
  },
  //计算选中商品数量
  calcSelectedCount(){
    var selectedCount = 0;
    var listData = this.data.listData;
    for(var i in listData){
      if (listData[i].isSelected){
        selectedCount = selectedCount + listData[i].num
      }
    }
    this.setData({ selectedCount: selectedCount})
  },
  //初始数量选中器状态
  initQuentity(){
    var listData = this.data.listData;
    for (var i in listData) {
      console.log(listData[i].num)
      if (listData[i].num == 1) {
        listData[i].isMinDis = true
      } else if (listData[i].num == listData[i].max_num){
        listData[i].isMaxDis = true
      }
    }
    this.setData({listData: listData})
  },
  changeQuentity(event){
    var self = this;
    var type = event.currentTarget.dataset.type;    
    var index = event.currentTarget.dataset.index;
    var listData = this.data.listData; 
    //添加
    if (type == 'add'){
      var maxnum = event.currentTarget.dataset.maxnum;
      var oncenum = event.currentTarget.dataset.oncenum;     
      listData[index].isMinDis = false;
      if (listData[index].num == maxnum){
        listData[index].isMaxDis = true;
        Api.Utils.toast('亲，该宝贝不能购买更多哦！')
      } else if (listData[index].num >= oncenum && oncenum !=0){
        Api.Utils.toast('亲，宝贝数量已超过限购数！')
      }else{
        wx.showLoading({ title: '加载中...', mask: true})
        self.quentityApi(listData[index].goods_id, 1)
        listData[index].num++;
      }
    //减少   
    }else if(type == 'subtract'){
      listData[index].isMaxDis = false;
      if (listData[index].num == 1){
        listData[index].isMinDis = true
      }else{
        wx.showLoading({title: '加载中...',mask:true})
        self.quentityApi(listData[index].goods_id, -1)
        listData[index].num--;
      } 
    }
    this.setData({
      listData: listData
    })
    this.calcMoney()
    this.ShopcarCount()
    this.calcSelectedCount()
  },
  quentityApi(id, num){
    
    Api.authPost('/mall/cart/add', {
      id: id,
      num: num
    },function(res){
      
    })
  },
  navigateTo(e) {
    Api.Utils.href(e);
  }
})
