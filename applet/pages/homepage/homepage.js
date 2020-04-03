// pages/homepage/homepage.js

const app = getApp()
const cookieUtil = require('../../utils/cookie.js')
const authUtil = require('../../utils/auth.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLogin: null,
    userInfo: null,
    hasUserInfo: null,
    personal_grids: null, //个人应用
  },

  onReadCookies: function () {
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/test',
      success(res) {
        var cookie = cookieUtil.getSessionIDFromResponse(res)
        console.log(cookie)
      }
    }
    )
  },
  //应用
  onNavigatorTapApp: function (e) {
    var dataType = e.currentTarget.dataset.type
    var index = e.currentTarget.dataset.index
    if (dataType) {
      var appItem = this.data.personal_grids[index]
    } else {
      var appItem = this.data.all_grids[index]
    }
    console.log('[在wxml中，只有用户数据定义了data-typt属性]，您点击的数据类型为：' + dataType + '点击的app为：')
    console.log(appItem)
    if (appItem.application == 'weather') {
      wx.navigateTo({ url: '../weather/weather', })
    } else if (appItem.application == 'backup-image') {
      wx.navigateTo({
        url: '../backup/backup',
      })
    } else if (appItem.application == 'stock') {
      wx.navigateTo({
        url: '../stock/stock'
      })
    } else if (appItem.application == 'joke') {
      wx.navigateTo({
        url: '../service/service?type=joke'
      })
    } else if (appItem.application == 'constellation') {
      wx.navigateTo({
        url: '../service/service?type=constellation',
      })
    } else if (appItem.application == 'clamav') {
      wx.navigateTo({
        url: '../clamav/clamav',
      })
    } else if (appItem.application == 'dns') {
      wx.navigateTo({
        url: '../dns/dns',
      })
    } else if (appItem.application == 'blog') {
      wx.navigateTo({
        url: '../blog/blog',
      })
    }
  },


  // navigator跳转处理
  onNavigatorTap: function (event) {
    var that = this
    var promise = authUtil.getStatus(app)
    promise.then(function (status) {
      if (status) {
        that.setData({ isLogin: true })
        app.setAuthStatus(true)
      } else {
        that.setData({ isLogin: false })
        app.setAuthStatus(false)
        wx.showToast({
          title: '请先授权登陆', icon: 'none'
        })
      }
      if (status) {
        // 获取由 data-type 标签传递过来的参数
        console.log(event.currentTarget.dataset.type)
        var navigatorType = event.currentTarget.dataset.type

        if (navigatorType == 'focusCity') {
          navigatorType = 'city'
        } else if (navigatorType == 'focusStock') {
          navigatorType = 'stock'
        } else {
          navigatorType = 'constellation'
        }
        var url = '../picker/picker?type=' + navigatorType
        wx.navigateTo({
          url: '../picker/picker?type=' + navigatorType,
        })
      }
    })
  },

  authorize: function () {
    console.log('authorize login')
    var that = this
    // 登陆并获取cookie
    wx.login({
      success: function (res) {
        //是从微信服务端返回code，再把code发送到开发者服务器
        var code = res.code
        var appId = app.globalData.appId
        var nickname = app.globalData.userInfo.nickName
        // 请求后台
        wx.request({
          url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/authorize',
          method: 'POST',
          data: {
            code: code,
            appId: appId,
            nickname: nickname
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            wx.showToast({
              title: '授权成功',
            })
            // 保存cookie
            var cookie = cookieUtil.getSessionIDFromResponse(res)
            cookieUtil.setCookieToStorage(cookie)
            that.setData({
              isLogin: true,
              userInfo: app.globalData.userInfo,
              hasUserInfo: true
            })
            app.setAuthStatus(true)
          }
        })
      }
    })
  },
  logout: function () {
    var that = this
    var cookie = cookieUtil.getCookieFromStorage
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/logout',
      method: 'GET',
      header: header,
      success: function (res) {
        console.log('pages/homepage.js/logout: log', res)
        that.setData({
          isLogin: false,
          userInfo: null,
          hasUserInfo: false
        })
        cookieUtil.setCookieToStorage('')
        app.setAuthStatus(false)
      }
    })
  },
  getStatusFromRemote: function () {
    var that = this
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/status',
      method: 'GET',
      header: header,
      success: function (res) {
        if (res.data.data.is_authorized == 1) {
          wx.showToast({title: '用户在线', icon: 'none'})
        } else {
          wx.showToast({title: 'Session过期，请重新登陆', icon:'warning'})
        }
      }
    })
  },

  /**
   * 个人应用数据
   */
  //请求后台获取用户个人应用数据
  updatePersonalMenuData: function () {
    var that = this
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/menu/user',
      header: header,
      success: function (res) {
        console.log(res)
        var personalMenuData = []
        if (res.data.data) {
          personalMenuData = res.data.data
        } else {
          wx.showToast({
            title: '您没有关注的应用',
            icon: 'none'
          })
        }
        wx.hideLoading()
        that.setData({ personal_grids: personalMenuData })
      }
    })
  },
  addApp: function () {
    var that = this
    if (!that.data.hasUserInfo) {
      wx.showToast({ title: '请先登陆', icon: null })
      return
    }
    wx.navigateTo({
      url: '../applist/applist?userMenu=' + JSON.stringify(that.data.personal_grids),
    })
  },
  //删除用户关注的应用
  deletePersonalItem: function (e) {
    var that = this
    var deleteType = e.currentTarget.dataset.type
    var deleteIndex = e.currentTarget.dataset.index
    var personal_grids = that.data.personal_grids
    wx.showModal({
      title: '删除应用',
      content: '将删除' + deleteType + '应用',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', })
          personal_grids.splice(deleteIndex, 1)
          that.setData({ personal_grids: personal_grids })
          //再调研POST REQUEST更新后台用户数据
          that.onSave()
        }
      }
    })
  },
  onSave: function () {
    var that = this
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/menu/user',
      header: header,
      method: 'POST',
      data: { data: that.data.personal_grids },
      success: function (res) {
        wx.hideLoading()
        wx.showToast({ title: '已移除', })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.updatePersonalMenuData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.updatePersonalMenuData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.updatePersonalMenuData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})