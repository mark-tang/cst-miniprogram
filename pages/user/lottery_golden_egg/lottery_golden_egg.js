import Api from "../../../utils/api.js"
import { isMobile } from "../../../utils/util";
var app = getApp();
var eggBengin = false
Page({
  data: {
    lotNum: '',
    showMask: false,
    whichBroken: '',
    showConfirm: false,
    isPrize: true,
    allEggImg: [
      {
        "img": "../../../images/lottery-egg1.png",
        "activeImg": "../../../images/lottery-egg1-broken.png",
        "className": "first-egg",
        "active": false,
      },
      {
        "img": "../../../images/lottery-egg2.png",
        "activeImg": "../../../images/lottery-egg2-broken.png",
        "className": "second-egg",
        "active": false,
      },
      {
        "img": "../../../images/lottery-egg3.png",
        "activeImg": "../../../images/lottery-egg3-broken.png",
        "className": "third-egg",
        "active": false,
      }
    ],
    awardsContent: [],
    ruleContent: [],
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      host: Api.config.host,
      id: options.id,
      type: options.type,
      title: options.title,
    })
    wx.setNavigationBarTitle({
      title: options.title,
    })
    this.queryData()
  },
  queryData() {
    var self = this;
    var id = self.data.id;
    Api.authPost('/active/enter', {
      type: self.data.type,
      id: id
    }, function (res) {
      //console.log(res)
      var rules = (res.data.rule).split('<br />')
      self.setData({
        lotNum: res.data.haveJoinNum_day,
        awards: res.data.awards,
        discImgUrl: res.data.bgImg,
        rules: rules,
        showApi: true,
        showDisc: true,
        name: res.data.user_name,
        phone: res.data.user_phone,
      })
    })
  },
  onShareAppMessage: function () {
    var self = this
    return {
      title: self.data.title,
      // path: '/pages/buy/lottery_golden_egg/lottery_golden_egg?method=share' +
      // '&id=' + self.data.id +
      // '&title=' + self.data.title +
      // '&type=' + self.data.type,
      path: '/pages/buy/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {

      }
    }
  },
  confirmAward(e) {
    let self = this;
    let name = e.detail.value.name;
    let phone = e.detail.value.phone;
    if (!name) { app.showToast('请填写姓名'); return };
    if (!phone) { app.showToast('请填写手机号码'); return };
    if (!isMobile(phone)) { app.showToast('手机号码错误'); return };
    Api.authPost('/v2/active/add-name-tel', {
      jid: self.data.jid,
      user_name: name,
      user_phone: phone,
    }, function (res) {
      if (res.code == 200) {
        // app.showToast('提交信息成功')
        self.setData({
          showConfirm: false,
        })
        self.dialogCtrl('奖品已发放到卡包中，请在卡包中查看！', self.data.diaTitle)
      }

    })
  },
  brokenEgg(event) {
    var self = this;
    var index = event.currentTarget.dataset.index;
    var allEggImg = this.data.allEggImg;
    if (self.data.lotNum <= 0) {
      app.showToast('您今天的抽奖机会已经用完了,明天再来吧！')
      return
    }
    if (eggBengin) {
      return
    }
    eggBengin = true
    self.reLoadEgg()
    allEggImg[index].active = true;
    self.setData({
      allEggImg: allEggImg,
      whichBroken: 'broken' + index,
      runBroken: 'run-broken'
    })
    Api.authPost('/v2/active/lottery', {
      id: self.data.id,
      //type: self.data.type
    }, function (res) {
      self.dialogCtrl(res.data.content, res.data.title);
      if (self.data.phone) {
        self.dialogCtrl(res.data.content, res.data.title)
      } else {
        self.setData({
          showConfirm: true,
        })
      }
      self.setData({
        lotNum: Number(self.data.lotNum) - 1,
        runBroken: '',
        jid: res.data.jid
      });
      eggBengin = false
    }, function (res) {
      self.dialogCtrl(res.msg)
      self.setData({ isRun: false })
    })

  },
  reLoadEgg() {
    var allEggImg = this.data.allEggImg;
    for (var i in allEggImg) {
      allEggImg[i].active = false;
    }
    this.setData({
      allEggImg: allEggImg,
    })
  },
  dialogCtrl(dialogCon, dialogTitle) {
    dialogTitle ? dialogTitle : dialogTitle = "温馨提示"
    var self = this;
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
    });
    if (this.data.showMask) { // 隐藏
      self.reLoadEgg()
      animation.scale(.8).opacity(0).step();
      setTimeout(function () {
        animation.scale(0).step()
        self.setData({
          dialogAnimaData: animation.export()
        })
        // if (self.data.isPrize) {
        //   self.setData({
        //     showConfirm: true,
        //   })
        // }
      }.bind(self), 200)
    } else {                   // 显示
      animation.scale(1).opacity(1).step();
    }
    if (dialogCon == '亲，没有中奖哦，再接再厉吧！') {
      self.setData({
        isPrize: false
      })
    }
    let dialogTips = dialogCon == '亲，没有中奖哦，再接再厉吧！' ? '' : '，请前往卡包查看奖品哦！'

    this.setData({
      dialogAnimaData: animation.export(),
      showMask: !this.data.showMask,
      dialogCon: dialogCon + dialogTips,
      dialogTitle: dialogTitle,
    });
  },
  awardCtrl(e) {
    var self = this;
    var id = e.currentTarget.dataset.id;
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
    });
    if (self.data.showMask2) { // 隐藏
      animation.scale(.8).opacity(0).step();
      setTimeout(function () {
        animation.scale(0).step()
        self.setData({
          awardAnimaData: animation.export(),
          showAwardMore: false,
        })
      }.bind(self), 200)
    } else {                // 显示
      Api.authPost('/active/prize', {
        pid: id
      }, function (res) {
        res.data.rules = (res.data.rules).split('<br />')
        self.setData({
          awardDetail: res.data,
          showAwardMore: true,
        });
      })
      animation.scale(1).opacity(1).step();
    }

    self.setData({
      awardAnimaData: animation.export(),
      showMask2: !self.data.showMask2,
    });

  }
})