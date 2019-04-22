/**
 * 公共函数
 */
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function formatTime2(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//数组去重
function uniq(array){
  let a = [];
  for (var i in array) {
    if (a.indexOf(array[i]) == -1) {
      a.push(array[i])
    }
  }
  return a;
}
//验证车牌
function isVehicleNumber(vehicleNumber) {
  var result = false;
  //匹配民用车牌和使馆车牌
  var exp_1 = /^[京津冀晋蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼川贵云渝藏陕甘青宁新使]{1}[A-Z]{1}[0-9a-zA-Z]{5,6}$/;
  //匹配特种车牌(挂,警,学,领,港,澳)
  var exp_2 = /^[京津冀晋蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼川贵云渝藏陕甘青宁新]{1}[A-Z]{1}[0-9a-zA-Z]{4}[挂警学领港澳]{1}$/;
  //匹配武警车牌
  var exp_3 = /WJ[京津冀晋蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼川贵云渝藏陕甘青宁新]?[0-9a-zA-Z]{5}$/;
  //匹配军牌
  var exp_4 = /[A-Z]{2}[0-9]{5}$/;

  if (
    exp_1.test(vehicleNumber) ||
    exp_2.test(vehicleNumber) ||
    exp_3.test(vehicleNumber) ||
    exp_4.test(vehicleNumber)
  ) {
    result = true;
  }
  return result
};

//验证手机
function isMobile(phoneNum) {
  var exp = /^1[0-9]{10}$/;
  return exp.test(phoneNum)
}

/*吐司提示框*/
function toast(msg){
  let str=msg?msg:'';
  wx.showToast({
    icon: 'none',
    title: str,
  })
}
//充值Submit
function reSubmit(){
  var pages = getCurrentPages();
  var currPage = pages[pages.length - 1];  //当前选择好友页面
  currPage.setData({isSubmit:false})
}
//跳转
function href(e){
  var url = e.currentTarget.dataset.url
  wx.navigateTo({
    url: url
  })
}
//向父页面传值
function toPrepageData(data){
  var pages = getCurrentPages();
  var prevPage = pages[pages.length - 2];
  prevPage.setData(data)
}
module.exports = {
  formatTime: formatTime,
  formatTime2: formatTime2,
  isVehicleNumber: isVehicleNumber,
  isMobile: isMobile,
  toast: toast,
  uniq: uniq,
  href: href,
  toPrepageData: toPrepageData,
  reSubmit: reSubmit,
}
