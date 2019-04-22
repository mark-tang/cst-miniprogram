import Utils from 'util';
class Api {
  constructor() {
    Object.assign(this, { Utils });
    this.name = "Api";
    this.config = {
      host: 'https://xxx.cn',
      appid: 'cstappid',
      version: 'V3.4.2'
    }
    this.getAppConfig();
  }
  getAppConfig() {
    var self = this;
    wx.getExtConfig({
      success: function (res) {
        // self.config.host = res.extConfig.attr.host;
        // self.config.appid = res.extConfig.attr.appid;
      }
    })
  }
  authPost(url, param, callback, errorHandler) {
    this.authBase("POST", url, param, callback, errorHandler)
  }
  authGet(url, param, callback, errorHandler) {
    this.authBase("GET", url, param, callback, errorHandler)
  }

  //获取新的登录session
  getSession(callback) {
    var self = this;
    //调用登录接口
    wx.login({
      success: function (res) {
        //获取用户信息

        wx.getUserInfo({
          success: function (nres) {
            //获取session

            wx.request({
              url: self.config.host + '/site/get-session',
              method: "POST",
              data: {
                code: res.code,
                rawData: nres.rawData,
                signature: nres.signature,
                encryptedData: nres.encryptedData,
                iv: nres.iv,
                appid: self.config.appid
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
              },
              success: function (res) {
                wx.hideLoading()
                //存储session
                switch (res.statusCode) {
                  case 200:
                    if (res.data.code == 200) {
                      wx.setStorage({
                        key: "expired",
                        data: res.data.data.expired,
                      })
                      wx.setStorage({
                        key: "hasMall",
                        data: res.data.data.mallStatus == 1,
                      })
                      wx.setStorage({
                        key: "session_key",
                        data: res.data.data.session,
                        // data:'oi822jhf6ncKdDsxEBPZL7B4gGek',
                        success: function () {
                          console.log(res.data)
                          callback()
                        },
                      })
                    } else {
                      res.data.msg != "更新用户信息错误" && self.Utils.toast(res.data.msg)
                    }

                    break;
                  default:
                    wx.showModal({
                      title: '请求出错,请重试',
                      cancelText: '取消',
                      confirmText: '重试',
                      content: '',
                      success: function (res) {
                        if (res.confirm) {
                          self.getSession(callback);
                        }
                      }
                    })
                    break
                }
              }
            })
          },
          fail: function (res) {
            wx.hideLoading()
            console.warn("用户未授予登录权限！")
            wx.navigateTo({
                  url: '../../jurisdiction/jurisdiction'
            })
          }
        })
      }
    })
  }

  authBase(method, url, param, callback, errorHandler) {
    let self = this;
    wx.getStorage({
      key: 'session_key',
      success(res) {
        //获取session时间，如果超期则获取新的session
        wx.getStorage({
          key: 'expired',
          success: function (exPiredRes) {
            var nowDate = Math.round(new Date().getTime() / 1000)
            if (exPiredRes.data < (nowDate + 500)) {
              self.getSession(function () {
                self.authBase(method, url, param, callback, errorHandler);
              })
            } else {
              var session_key = res.data;
              wx.request({
                method: method,
                url: self.config.host + url,
                data: param,
                header: {
                  'content-type': 'application/x-www-form-urlencoded',
                  'Authorization': 'Bearer ' + session_key,
                },
                success: function (res) {     
                  wx.hideLoading()
                  if (url =='/tongji/view-record'){
                    return;
                  }                  
                  switch (res.statusCode) {
                    case 401:
                      console.info("session错误或过期，正在重新授权")                     
                      self.getSession(function () {
                        self.authBase(method, url, param, callback, errorHandler);
                      })
                      break;
                    case 200:
                      if (res.data.code == 200) {
                        callback(res.data, res.header)
                      } else {
                        if (errorHandler) {
                          errorHandler(res.data)
                        } else {
                          self.Utils.toast(res.data.msg)
                        }
                      }
                      break;
                    default:
                      wx.showModal({
                        title: '',
                        cancelText: '取消',
                        confirmText: '重试',
                        content: '服务器请求出错,请稍后重试！\n错误代码' + res.statusCode,
                        success: function (res) {
                          if (res.confirm) {
                            self.authBase(method, url, param, callback, errorHandler);
                          }
                        }
                      })

                      break;
                  }
                }, fail(res) {
                }, complete() {
                  self.Utils.reSubmit()
                }
              })
            }

          },
          fail(exPiredRes) {
            self.getSession(function () {
              self.authBase(method, url, param, callback, errorHandler);
            })
          }
        })

      }, fail() {
        self.getSession(function () {
          self.authBase(method, url, param, callback, errorHandler);
        })
      },
    })
  }
  // 小程序登录
  _login() {
    var self = this;
    return new Promise((resolve, reject) => {
      wx.login({
        success: function (res) {
          //获取用户信息
          wx.getUserInfo({
            success: function (nres) {
              //获取session
              wx.request({
                url: self.config.host + '/site/get-session',
                method: "POST",
                data: {
                  code: res.code,
                  rawData: nres.rawData,
                  signature: nres.signature,
                  encryptedData: nres.encryptedData,
                  iv: nres.iv,
                  appid: self.config.appid
                },
                header: {
                  'content-type': 'application/x-www-form-urlencoded',
                },
                success: function (result) {
                  resolve(result.data.data);
                }
              })
            },
            fail: function (res) {
              reject({ code: 700 });
            }
          })
        },
        fail: function (res) {
          self.Utils.toast(res.errMsg)
          reject({ code: 700 });
        }
      });
    });
  }

  // 获取Session Key
  _getSessionKey() {
    var self = this;
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: 'session_key',
        success(response) {
          const { data } = response;
          resolve(data);
        },
        fail() {
          self._login().then(sessionData => {

            //存储session
            wx.setStorage({
              key: "expired",
              data: sessionData.expired,
            })
            wx.setStorage({
              key: "session_key",
              data: sessionData.session,
              success: function () {
                resolve(sessionData.session);
              }
            })
          }).catch(err => {
            reject({ code: 700 });
          });
        }
      })
    });
  }

  _checkExpired(expired) {
    var nowDate = Math.round(new Date().getTime() / 1000) + 500;
    return expired < nowDate ? true : false;
  }

  request(_type, _url, _data, _header = {}) {
    var self = this;
    return new Promise((resolve, reject) => {
      // 判断expired是否过期
      if (self._checkExpired(wx.getStorageSync('expired') || 0)) {
        console.error('expired过期');
        wx.removeStorageSync('session_key');
        wx.removeStorageSync('expired');
      }
      console.log('获取Session');
      self._getSessionKey().then(sessionKey => {
        Object.assign(
          _header,
          {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${sessionKey}`,
          }
        );
        console.log('发送请求');
        wx.request({
          method: _type,
          url: self.config.host + _url,
          data: _data,
          header: _header,
          datatype:'json',
          success: function (response) {
            console.log('请求成功');
            const { statusCode, data, errMsg } = response;
            switch (statusCode) {
              case 200:
                console.log('200');
                resolve(data); 
                break;
              case 401:
                console.log('授权失败');
                // 删除session_key
                wx.removeStorageSync('session_key');
                self.request(_type, _url, _data, _header).then(response => {
                  console.log('再次请求数据成功')
                  resolve(response);
                });
                break;
              default:
                wx.showModal({
                  title: '提示',
                  cancelText: '取消',
                  confirmText: '重试',
                  content: '服务器请求出错,请稍后重试！\n错误代码' + statusCode,
                  success: function (res) {
                    if (res.confirm) {
                      self.request(_type, _url, _data, _header)
                    }
                  }
                })
                reject(data);
            }
          },
          fail: function (response) {
            reject(response.data);
          }
        })
      }).catch(err => {
        console.log('授权失败：' + err.code);
        if (err.code && err.code == 700) {
          wx.showModal({
            title: '授权失败',
            showCancel: false,
            content: '拒绝授权小程序将无法使用完整功能，请勾选用户信息权限获取完整体验！',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../../jurisdiction/jurisdiction'
                })
              }
            }
          })
        }
      });
    });
  }

  post(_url, _data = {}, _header = {}) {
    return this.request('POST', _url, _data, _header);
  }

  get(_url, _data = {}, _header = {}) {
    return this.request('GET', _url, _data, _header);
  }
}

export default new Api();