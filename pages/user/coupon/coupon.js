import Api from "../../../utils/api.js";
import wxbarcode from '../../../utils/qrCode/index.js';

var app = getApp()
Page({
  data: {
    showCode:false,
    code: '',
    couponStatus:3,
    initQueryData: true,
    page: 1,
    pageCount: null,
    commonApplyEnter: 0
  },
  onLoad (){
    app.viewRecord();//活跃度统计
    var self = this;
    wx.showLoading({
      title: '加载中...',
    })
    app.getSystemInfo((res) => {
      console.log(res.windowHeight)
      
      self.setData({
        windowHeight: res.windowHeight - res.windowWidth / 750 * 102
      })
    })
    this.searchCanReceiveData();
    // this.search()
    
  },
  searchCanReceiveData(){
    if (this.data.page == 1){
      this.setData({
        listDataCan: [],
      })
    }
    var self=this;
    wx.showLoading({
      title: '加载中...',
    })
    Api.authGet('/coupon/list/can-receive?page=' + this.data.page, {}, function (res) {
      wx.hideLoading();
      if (res.data.length != 0) {
        // let listDataCan = res.data.list.data;
        // let couponStyle=this.couponStyle;
        self.setData({
          // couponStyle: couponStyle,
          listDataCan: [...self.data.listDataCan, ...res.data.list.data],
          couponStatus: 3,
          showPage: true,
          pageCount: res.data.list.page.page_count,
          commonApplyEnter: res.data.permission.common_apply_enter //通用申请入口是否开放(1为开放,0为不开放)
        })
      } else {
        self.setData({
          listDataCan: [...self.data.listDataCan, ...res.data.list.data],
          showEmpty: true,
          pageCount: res.data.list.page.page_count,
        })
      }

    })
  },
  search(){
    var self=this;
    wx.showLoading({
      title: '加载中...',
    })
    Api.authPost('/coupon/record/index', {}, function (res) {
      self.setData({
        initQueryData: false
      })
      wx.hideLoading();
      console.log(res.data)
      var couponStyle = [{ title: '未使用', status: false }, { title: '已过期', status: false }, { title: '已使用', status: false }];
      
      if (res.data.length != 0) {
        var listData = res.data;
        for (var key in listData) {
          var item = listData[key].rules.split('<br />')
          listData[key].rules = item;
          if (listData[key].couponStatus==0){
            couponStyle[0].status=true;
          }
          if (listData[key].couponStatus == 1) {
            couponStyle[1].status = true;
          }
          if (listData[key].couponStatus == 2) {
            couponStyle[2].status = true;
          }        
          if (listData[key].useStatus != 'used') {
            if (listData[key].deadDays < 0) {
              if (listData[key].deadLines != 0) {
                listData[key].useStatus = 'overdue'
              }
            }
          }
        }
        console.log(listData)
        self.setData({
          couponStyle: couponStyle,
          listData: listData,
          showPage: true,
        })
      } else {
        self.setData({
          showEmpty: true,
        })
      }

    })
  },
  showCode(e) {
    let code = e.currentTarget.dataset.code;
    wxbarcode.qrcode('qrcode', code, 420, 420);
    this.setData({
      showCode:true,
      code: code
    })
  },
  onTap(e){
    let couponStatus = e.currentTarget.dataset.coupon;    
    this.setData({ couponStatus: couponStatus })
    if(couponStatus != 3 && this.data.initQueryData){
      this.search();
    }
  },
  hideCode() {
    this.setData({
      showCode: false
    })
  },
  navigateTo (e){
    Api.Utils.href(e);
  },
  applySDKCard(e) {
    let self = this;
    let code = e.currentTarget.dataset.code;
    wx.showLoading({
      title: '加载中...',
    })
    Api.authPost('/coupon/sdk/add-card', {id: code}, function (res) {
      wx.hideLoading();
      if (res.code == 200) {
        // 如果后台返回的不是一个数组
        let cardData =[];
        res.data.cardExt = JSON.stringify(res.data.cardExt)
        cardData.push(res.data);
        wx.addCard({
          cardList: cardData, // 需要添加的卡券列表
          success(res) {
            var cardList = res.cardData; // 添加的卡券列表信息
            console.log(res)
            console.log(res.cardList) // 卡券添加结果
            self.setData({
              initQueryData: true,
              page: 1,
            })
            self.searchCanReceiveData();
            
          },
          error(res) {
            /* this.$dialog.toast({
              mes: res.errMsg,
              timeout: 2500
            }); */
          }
        });
      } else {
        
      }

    })
    
  },
  applyCard(e) {
    let code = e.currentTarget.dataset.code;
    console.log('code')
    wx.navigateTo({ url: `/pages/user/apply_card/apply_card?id=${code}`})
    /* wxbarcode.qrcode('qrcode', code, 420, 420);
    this.setData({
      showCode:true
    }) */
  },
  onReachBottom() {
    let self = this;
    let page = this.data.page;
    let pageCount = this.data.pageCount;
    if (page < pageCount) {
      page++
      self.setData({
        page: page
      })
      self.searchCanReceiveData()
    }

  },
})
