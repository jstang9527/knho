//app.js
const cookieUtil = require('utils/cookie.js')

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  getAuthStatus: function () {
    return this.globalData.auth.isAuthorized
  },
  setAuthStatus: function (status) {
    console.log('app.js/setAuthStatus: set auth status:', status)
    if (status == true || status == false) {
      this.globalData.auth.isAuthorized = status
    } else {
      console.log('app.js/setAuthStatus: invalid status.')
    }
  },
  onShow: function () { },
  onHide: function () { },
  globalData: {
    userInfo: null,
    serverUrl: 'http://192.168.27.128:8000',
    apiVersion: '/api/v1.0',
    appId: 'wxb2671a978f6f8cda',
    //这个字段是判断用户的主动登陆和主动注销
    auth: {
      isAuthorized: false
    }
  }
})