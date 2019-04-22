import Api from '../../../utils/api';
import { isMobile } from "../../../utils/util";
var app = getApp();
var i = 1;
Page({
  data: {
    showMask: false,
    isRuning: false,
    nowDeg: 180,
    lotNum: '',
    showConfirm: false,
    isPrize: true,
    host: Api.config.host,
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    wx.setNavigationBarTitle({ title: options.title })
    wx.showLoading({ title: '加载中...' })
    i = 1;
    this.setData({
      id: options.id,
      type: options.type,
      title: options.title
    })

    this.initData()
  },
  initData() {
    var self = this;
    var id = self.data.id;
    Api.authPost('/active/enter', {
      type: self.data.type,
      id: id
    }, function (res) {
      console.log(res);
      let rules = res.data.rule
      rules = !rules ? rules : rules.split('<br />')
      self.setData({
        lotNum: res.data.haveJoinNum_day,
        awards: res.data.awards,
        discImgUrl: 'https://app.chexiu.cn' + res.data.bgImg,
        fingerImgUrl: 'https://app.chexiu.cn/images/lottery-draw-finger.png',
        backtopImgUrl: 'https://app.chexiu.cn/images/lottery-draw-backtop.png',
        rules: rules,
        name: res.data.user_name,
        phone: res.data.user_phone,
        showDisc: true,
        showPage: true,
      })
    })
  },
  imageLoad() {
    var self = this;
    if (i >= 3) {
      wx.hideLoading()
      this.setData({ showPage: true })
    }
    i++
  },
  discCtrl() {
    var self = this;
    if (this.data.lotNum <= 0) {
      wx.showModal({
        title: '提示',
        content: '您今天的抽奖机会已经用完了！',
        showCancel: false
      })
      return
    }
    if (this.data.isRuning) {
      // this.dialogCtrl('亲，不要着急哦！')
      return
    }

    this.setData({ isRuning: true })

    Api.authPost('/v2/active/lottery', {
      id: self.data.id,
    }, function (res) {
      self.setData({ jid: res.data.jid })
      self.run(-res.data.angle, res.data.content, res.data.title);
    }, function (res) {
      self.dialogCtrl(res.msg)
      self.setData({ isRuning: false })
    })

  },
  run(nowDeg, content, title) {
    var self = this;
    var animation = wx.createAnimation({
      duration: 4000,
      timingFunction: 'ease'
    })

    this.animation = animation

    animation.rotate(-2160 + nowDeg).step();
    this.setData({
      discAnimaData: animation.export(),
      lotNum: Number(self.data.lotNum) - 1,
    });
    setTimeout(function () {
      var animation = wx.createAnimation({ duration: 0 });
      animation.rotate(nowDeg).step();
      self.setData({
        discAnimaData: animation.export(),
        isRuning: false,
      });
      if (content == '亲，没有中奖哦，再接再厉吧！') {
        self.dialogCtrl(content, title);
        return;
      }
      if (self.data.phone) {
        self.dialogCtrl(content, title)
      } else {
        self.setData({
          showConfirm: true,
          diaContent: content,
          diaTitle: title
        })
      }

    }, 4200)
  },
  dialogCtrl(dialogCon, dialogTitle) {
    dialogTitle ? dialogTitle : dialogTitle = "温馨提示"
    var self = this;
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
    });
    if (this.data.showMask) { // 隐藏
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
  },
  confirmAward(e) {
    let self = this;
    let name = e.detail.value.name;
    let phone = e.detail.value.phone;
    if (!name) { app.showToast('请填写姓名'); return };
    if (!phone) { app.showToast('请填写手机号码'); return };
    if (!isMobile(phone)) { app.showToast('手机号码错误'); return };
    self.setData({
      phone: phone
    })
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
  onShareAppMessage: function () {
    var self = this
    return {
      title: self.data.title,
      path: '/pages/buy/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {

      }
    }
  }
})
