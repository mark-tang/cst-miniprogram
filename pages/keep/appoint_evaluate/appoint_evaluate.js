//index.js
var utils = require('../../../utils/util.js');

//获取应用实例
var app = getApp()
Page({
  data: {
    selected1:true,
    selected2: false,
    selected3: false,
    evaCon:'',
    fastEvaList:[
      { content: '服务态度很好，车辆性能不错，对本次试驾很满意', isSelected: false},
      { content: '服务态度很好', isSelected: false },
      { content: '很赞', isSelected: false },
      { content: '车辆性能不错', isSelected: false },
      { content: '车辆性能', isSelected: false },
      { content: '对本次试驾很满意', isSelected: false },
    ]
  },
  onLoad (){
    app.viewRecord();//活跃度统计
  },
  tapEvaluate (e) {
    var index = e.currentTarget.id;
    var selectArr = [];
    for(var i=0;i<3;i++){
      selectArr[i] = false;
    }
    selectArr[index] = true;
    this.setData({
      selected1: selectArr[0],
      selected2: selectArr[1],
      selected3: selectArr[2],
    })
  },
  //快速评价
  fastEva(e){
    var index = e.currentTarget.id;
    var fastEvaList = this.data.fastEvaList;
    for (var i in fastEvaList) {
      fastEvaList[i].isSelected = false;
    }
    fastEvaList[index].isSelected = true;
    this.setData({
      fastEvaList: fastEvaList,
      evaCon: fastEvaList[index].content
    })
  },
  //提交评价
  submitData (){
    console.log(this.data.evaCon);
    if (!(this.data.selected1 || this.data.selected2 || this.data.selected3)){
      utils.toast("请选择评价")
    } else if (!this.data.evaCon){
      utils.toast("请输入评价内容")
    }else{
      wx.showToast({
        title: '评价成功',
      })
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        })
      }, 2000)
    }

  }
  
})
