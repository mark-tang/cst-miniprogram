import Api from "../../../utils/api.js";
//获取应用实例
var app = getApp()
Page({
  data: {
    selected2: true,
    selected1: false,
    selected0: false,
    level: 2,
    evaCon: '',
    fastEvaListIndex:0,
    fastEvaList: [
      { content: '服务态度很好，认真负责，点赞', isSelected: false },
      { content: '服务态度一般，需要继续加油', isSelected: false },
      { content: '服务态度很差，比较敷衍', isSelected: false },
    ]
  },
  onLoad(options) {
    app.viewRecord();//活跃度统计
    var advisorId = options.id;
    var advisorType = options.type;
    this.setData({
      advisorId: advisorId,
      advisorType: advisorType
    })
  },
  tapEvaluate(e) {
    var id = e.currentTarget.id;
    var index = e.currentTarget.dataset.index;
    var selectArr = [];
    for (var i = 0; i < 3; i++) {
      selectArr[i] = false;
    }
    selectArr[id] = true;
    this.setData({
      selected2: selectArr[2],
      selected1: selectArr[1],
      selected0: selectArr[0],
      fastEvaListIndex: index,
      level: id,
      evaCon:'',
    })
  },
  //快速评价
  fastEva(e) {
    var con = e.currentTarget.dataset.con;
    this.setData({
      evaCon: con
    })
  },
  bindinput(e) {
    this.setData({
      evaCon: e.detail.value
    })
  },
  //提交评价
  submitData() {
    var self = this;
    if (!this.data.evaCon) {
      Api.Utils.toast("请输入评价内容")
    } else {
      self.setData({ isSubmit: true })
      var nowLevel = self.data.level;
      if (self.data.advisorType == 1){
        if (nowLevel == 0){
          nowLevel = 1
        } else if (nowLevel == 1){
          nowLevel = 0
        } else if (nowLevel == 2) {
          nowLevel = 2
        }
      } else if (self.data.advisorType == 2){
        if (nowLevel == 0) {
          nowLevel = 2
        } else if (nowLevel == 1) {
          nowLevel = 1
        } else if (nowLevel == 2) {
          nowLevel = 0
        }
      }
      Api.authPost('/comment/add-comment', {
        level: nowLevel,
        content: self.data.evaCon,
        au_id: self.data.advisorId, 
        type: self.data.advisorType
      }, function (res) {
        if (res.code == 200) {
          wx.showToast({
            title: '评价成功',
            mask: true,
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
          // if(self.data.level == 0){
          //   wx.showModal({
          //     showCancel: true,
          //     cancelText: '暂时不换',
          //     confirmText: '换顾问',
          //     content: '评价成功！是否要更换顾问？',
          //     success: function (res) {
          //       if (res.confirm) {
          //         wx.navigateTo({
          //           url: '../advisor_change/advisor_change?type=' + self.data.advisorType
          //         })
          //       } else if (res.cancel) {
          //         wx.navigateBack({
          //           delta: 1
          //         })
          //       }
          //     }
          //   })
          // }else{
          //   wx.showToast({
          //     title: '评价成功',
          //     mask: true,
          //   })
          //   setTimeout(function () {
          //     wx.navigateBack({
          //       delta: 1
          //     })
          //   }, 1500)
          // }

        }
      })


    }

  }

})