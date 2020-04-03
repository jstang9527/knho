const cookieUtils = require('cookie.js')

function buildHeader() {
  var cookie = cookieUtils.getCookieFromStorage()
  var header = {}
  header.Cookie = cookie
  return header
}

/**
 * 查询用户状态
 * @ param app 全局唯一的app实例
 * @ param resolve 调用成功处理的函数
 * @ param reject 调用失败处理的函数
 */

function getStatus(app) {
  var url = app.globalData.serverUrl + app.globalData.apiVersion + '/auth/status'
  var header = buildHeader()
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      header: header,
      success: function (res) {
        if (res.data.data.is_authorized) { resolve(true) } 
        else { resolve(false) }
      },
      fail: function (res) { resolve(false) }
    })
  })
  return promise
}

module.exports = {
  getStatus: getStatus,
}