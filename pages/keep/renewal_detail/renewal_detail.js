//index.js
var utils = require('../../../utils/util.js');
import Api from "../../../utils/api.js";
//获取应用实例
var app = getApp()
Page({
  data: {
    statuType:'',
    statuText:'',
    lastStatu:'',
    hideTop:true,
    showPage:false,

  },
  onLoad(options){
    app.viewRecord();//活跃度统计
    var self = this;
    this.setData({
      lastStatu: options.id
    })
    this.queryData(options.id)
  },
  queryData(id){
    var self = this;
    wx.showLoading({
      title: '加载中...',
    })
    Api.authGet('/xubao/view',{id:id},function(res){
      res.data.dateline = utils.formatTime(new Date(res.data.dateline*1000));
      self.setData({
        listData:res.data
      })
      //顶部状态
      var statuType = ''
      var statuText = ''
      if (res.data.is_read == 0){
        statuType = 'waiting';
        statuText = '续保专员正在为您报价，请耐心等待!';
      }else if (res.data.is_read == 1){
        statuType = 'info';
        statuText = '续保专员已回复您提交的续保询价！';
      } else if (res.data.is_read == 2) {
        statuType = 'cancel';
        statuText = '您已取消此次续保询价！';
      } else if (res.data.is_read == 3) {
        statuType = 'success';
        statuText = '已购买此次续保询价的产品';
      }
      self.setData({
        showPage:true,
        statuType: statuType,
        statuText: statuText,
      })
      
      if (res.data.is_read == 1){
        self.showReport(res.data.last_record)
      }
      if (res.data.is_read == 3){
        // self.setData({
        //   statuText: res.data.last_record,
        // })
      }
      //self.showReport(self.data.str)
    })
  },
  showReport(data){
    var self = this;
    var str = data;

    //报表
    var reportForm = [];
    var total = ''
    if (/<b>/.test(str)){
      total = /我们的价格总计为:<b>([\d.]+)/.exec(str);
    }else{
      total = /我们的价格总计为:([\d.]+)/.exec(str);
    }
    
    var insurance_1 = /交强险:([\d.]+)/.exec(str);
    var insurance_2 = /第三者责任险\[([\d.]+)/.exec(str);
    var insurance_3 = /万]:([\d.]+)/.exec(str);
    var insurance_4 = /车上人员责任险:([\d.]+)/.exec(str);
    var insurance_5 = /车辆损失险:([\d.]+)/.exec(str);
    var insurance_6 = /盗抢险:([\d.]+)/.exec(str);
    var insurance_7 = /玻璃单独破碎险:([\d.]+)/.exec(str);
    var insurance_8 = /不计免赔特约险:([\d.]+)/.exec(str);
    var insurance_9 = /车上乘员损失险:([\d.]+)/.exec(str);
    var insurance_10 = /自燃险:([\d.]+)/.exec(str);
    var insurance_11 = /新增设备损失险:([\d.]+)/.exec(str);
    var insurance_12 = /精神损害赔偿险:([\d.]+)/.exec(str);
    var insurance_13 = /车身划痕险:([\d.]+)/.exec(str);
    var insurance_14 = /发动机损失特约险:([\d.]+)/.exec(str);
    var insurance_15 = /车船使用税:([\d.]+)/.exec(str);

    var insuranceUnit = Number(insurance_2[1]).toFixed(0)
    var remark = /备注：([\u4e00-\u9fa5_a-zA-Z0-9,，。.？！!?]+)/.exec(str);

    insurance_1 && reportForm.push({ name: '交强险', value: insurance_1[1] })
    insurance_2 && reportForm.push({ name: '第三者责任险[' + insuranceUnit + '万]', value: insurance_3[1] })
    insurance_4 && reportForm.push({ name: '车上人员责任险', value: insurance_4[1] })
    insurance_5 && reportForm.push({ name: '车辆损失险', value: insurance_5[1] })
    insurance_6 && reportForm.push({ name: '盗抢险', value: insurance_6[1] })
    insurance_7 && reportForm.push({ name: '玻璃单独破碎险', value: insurance_7[1] })
    insurance_8 && reportForm.push({ name: '不计免赔特约险', value: insurance_8[1] })
    insurance_9 && reportForm.push({ name: '车上乘员损失险', value: insurance_9[1] })
    insurance_10 && reportForm.push({ name: '自燃险', value: insurance_10[1] })
    insurance_11 && reportForm.push({ name: '新增设备损失险', value: insurance_11[1] })
    insurance_12 && reportForm.push({ name: '精神损害赔偿险', value: insurance_12[1] })
    insurance_13 && reportForm.push({ name: '车身划痕险', value: insurance_13[1] })
    insurance_14 && reportForm.push({ name: '发动机损失特约险', value: insurance_14[1] })
    insurance_15 && reportForm.push({ name: '车船使用税', value: insurance_15[1] })

    self.setData({
      reportForm: reportForm,
      totalCount: total[1],
      remark: remark[1],
      hideTop: false,
    })
  },
  appointEvaHref (){
    wx.navigateTo({
      url: '../appoint_evaluate/appoint_evaluate',
    })
  },
  callNum(e){
    var num = e.currentTarget.id;
    wx.makePhoneCall({
      phoneNumber: num
    })
  }
  
})
