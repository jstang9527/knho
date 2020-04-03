const cookieUtils = require('cookie.js')

function buildHeader() {
  var cookie = cookieUtils.getCookieFromStorage()
  var header = {}
  header.Cookie = cookie
  return header
}

/**
 * onLoad函数加载数据，onReady展示数据
 * 之后呢？也是，调用onLoad后再调用onReady
 * @ param app 全局唯一的app实例
 * @ param resolve 调用成功处理的函数
 * @ param reject 调用失败处理的函数
 */

function getUptime(app, hostname) {
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/prom/uptime?host=' + hostname,
      success: function (res) {
        var data = res.data.data
        data = data.days+'天'+data.hours+'时'+data.minutes+'分'
        resolve(data)
      },
      fail: function (res) { resolve() }
    })
  })
  return promise
}

function getContainers(app, hostname){
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/prom/containers?host=' + hostname,
      success: function (res) {
        resolve(res.data.data + '个')
      },
      fail: function (res) { resolve() }
    })
  })
  return promise
}

function getCpuGuage(app, hostname){
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/prom/cpu_guage?host=' + hostname,
      success: function (res) {
        resolve(res.data.data)
      },
      fail: function (res) { resolve() }
    })
  })
  return promise
}

function getCpuloadGuage(app, hostname) {
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/prom/cpuload_guage?host=' + hostname,
      success: function (res) {
        resolve(res.data.data)
      },
      fail: function (res) { resolve() }
    })
  })
  return promise
}

function getMemGuage(app, hostname){
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/prom/mem_guage?host=' + hostname,
      success: function (res) {
        resolve(res.data.data)
      },
      fail: function (res) { resolve() }
    })
  })
  return promise
}

function getDiskGuage(app, hostname){
  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/prom/disk_guage?host=' + hostname,
      success: function (res) {
        resolve(res.data.data)
      },
      fail: function (res) { resolve() }
    })
  })
  return promise
}
module.exports = {
  getUptime: getUptime,
  getContainers: getContainers,
  getCpuGuage: getCpuGuage,
  getMemGuage: getMemGuage,
  getDiskGuage: getDiskGuage,
  getCpuloadGuage: getCpuloadGuage
}