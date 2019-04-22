import Api from "../../../../utils/api.js";
import { isMobile} from "../../../../utils/util";
var app = getApp()
Page({
  data: {
    showResult: false,
    showInput: true,
    showForm: false,
    hasJoin: false,
    payStatus: 0
  },
  onLoad: function (options) {
    app.viewRecord();//活跃度统计
    this.setData({
      activeID:options.id,
      phone:options.tel,
    })
    this.queryData();
  },
  queryData() {
    let self = this;
    Api.authPost("/activity/jike/index", {
      id: this.data.activeID,
    }, function (res){
      console.log(res.data)
      let joinLog = res.data.my_join_log;
      self.setData({
        activeInfo: res.data,
        joinInfo: joinLog,
        payStatus: joinLog.pay_status || null, 
      })
      if (self.data.phone) {
        self.getInfo({ detail: { value: { phone: self.data.phone}}});
      }
    })
  },
  getInfo(e) {
    let self = this;
    let phone = e.detail.value.phone; 
    if (!phone) { app.showToast('请填写手机号');return;}
    if (!isMobile(phone)) { app.showToast('手机号码有误'); return; }

    this.setData({
      phone: e.detail.value.phone
    })
    Api.authPost('/activity/jike/pre-sign-up',{
      id: this.data.activeID,
      phone: this.data.phone
    },function(res) {
      /*
      * 签到状态【status】
      * 0 => '已报名、未签到'
      * 1 => '签到失败，活动不存在！'
      * 2 => '签到失败，该活动已删除！'
      * 3 => '签到失败，未提交报名信息！'
      * 4 => '重复签到！',
      * 5 => '签到失败，请重试。'
      */
      let status = res.data.status;
      self.setData({
        signStatus: res.data.status,
        payStatus: res.data.my_join_info.pay_status,
        showResult: true,
      })
      switch (status) {
        case 0:
          self.sign();
          self.setData({
            joinInfo : res.data.my_join_info,
          })
          break;
        case 1:
          self.setData({
            signStatusText : '签到失败，活动不存在！'
          })
          break;
        case 2:
          self.setData({
            signStatusText: '签到失败，该活动已删除！'
          })
          break;
        case 3:
          self.setData({
            showResult: false
          })
          if (self.data.activeInfo.locale_entry_enabled == 0) {
            app.showToast('签到失败未提前报名')
            return;
          };
          app.showToast('签到失败请先报名')
          setTimeout(res => {
            wx.navigateTo({
              url: `../index/index?id=${self.data.activeID}&sign=true&isSign=false`,
            })
          },1500)
          break;
        case 4:
          self.setData({
            signStatusText : '重复签到！',
            showForm : true,
            showInput : false,
            hasJoin : true,
          })
          break;
        case 5:
          self.setData({
            signStatusText : '签到失败，请重试。',
          })
          break;
      }      
    });
  },
  sign() {
    let self = this;
    Api.authPost('/activity/jike/sign-up',{
      active_id: this.data.activeID,
      phone: this.data.phone,
    },function(res) {
      if (res.code == 200) {
        self.setData({
          showResult: true,
          showForm: true,
          signStatusText : '签到成功',
          hasJoin : true,
        })
      }
    })
  },
  goActive() {
    wx.navigateTo({
      url: `../index/index?id=${this.data.activeID}&sign=true&isSign=true`,
    })
  }
})