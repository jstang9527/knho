const cookieUtils = require('cookie.js')

function buildHeader() {
  var cookie = cookieUtils.getCookieFromStorage()
  var header = {}
  header.Cookie = cookie
  return header
}

//這個是地图統計數據{name: china, value: 221}
function getMapData(app) {
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/alter/ithreat/statistics',
      success: function (res) {
        var data = res.data.data
        resolve(data)
      },
      fail: function (res) { resolve() }
    })
  })
  return promise
}
//请求

module.exports = {
  getMapData: getMapData
}