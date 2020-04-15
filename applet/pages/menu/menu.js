const app = getApp()
const cookieUtils = require('../../utils/cookie.js')
Page({
  //页面初始数据
  data: {
    apps: [{ name: '应用1' }, { name: '应用2' }],
    build_apps: [],
    pre_apps: [],
    personal_grids: null, //个人应用
    on_line: false,
    on_save: false,
  },//九宫格内容
  //生命周期函数--监听页面加载
  onLoad: function (options) {
    
  },
  //请求后台，更新all_grid数据
  updatePublicMenuData: function () {
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/menu/list',
      success: function (res) {
        var allMenuData = res.data.data
        var apps = []
        var build_apps = []
        var pre_apps = []
        for(var i=0;i<allMenuData.length;i++){
          if(allMenuData[i].category == 'build'){build_apps.push(allMenuData[i])}
          else if(allMenuData[i].category == 'prepare'){pre_apps.push(allMenuData[i])}
          else{apps.push(allMenuData[i])}
        }
        that.setData({ apps:apps, build_apps:build_apps, pre_apps:pre_apps })
        wx.hideLoading()
      }
    })
  },
  //公共应用列表点击app事件
  onNavigatorTap: function (e) {
    var dataType = e.currentTarget.dataset.type
    var index = e.currentTarget.dataset.index
    console.log(dataType)
    //appItem是选哪个分类，比如build还是ready类
    if (dataType) { var appItem = this.data.apps[index] } 
    else { var appItem = this.data.build_apps[index] }
    //全局通用页面跳转
    if (appItem.application == 'weather') { wx.navigateTo({ url: '../weather/weather', })} 
    else if (appItem.application == 'monitor') { wx.navigateTo({ url: '../monitor/monitor', })} 
    else if (appItem.application == 'clamav') { wx.navigateTo({ url: '../clamav/clamav', }) } 
    else if (appItem.application == 'dns'){ wx.navigateTo({ url: '../dns/dns', }) } 
    else if (appItem.application == 'blog') { wx.navigateTo({ url: '../blog/blog', })}
    else if (appItem.application == 'mico-service') { wx.navigateTo({ url: '../mico/mico', })}
    else if (appItem.application == 'attack') { wx.navigateTo({ url: '../ithreat/ithreat', })}
  },

  //！！！已抛弃、该功能在个人页面中实现、请求后台获取用户个人应用数据
  updatePersonalMenuData: function () {
    var that = this
    var cookie = cookieUtils.getCookieFromStorage()
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
        that.setData({ on_line: true, personal_grids: personalMenuData })
      }
    })
  },
  //！！！已抛弃、该功能在个人页面中实现、获取用户状态，然后是否展示用户数据
  updatePersonalData_baseOn_UserAuthStatus: function () {
    var that = this
    //console.log('全局认证状态：'+app.getAuthStatus())
    if (!app.getAuthStatus()) {
      //用户主动注销状态
      that.setData({ on_line: false, personal_grids: null })
      wx.hideLoading()
      console.log('用户注销态')
      return
    }
    //用户没有主动注销，但是要判断session是否过期，并跟新全局认证变量
    var that = this
    var cookie = cookieUtils.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/status',
      header: header,
      success: function (res) {
        if (res.data.data.is_authorized) {
          //已认证
          console.log('用户在线')
          app.setAuthStatus(true)
          that.updatePersonalMenuData()
        } else {
          console.log('session过期')
          app.setAuthStatus(false)
          that.setData({ on_line: false, personal_grids: null })
          wx.hideLoading()
        }
      }
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showLoading({
      title: '加载中',
    })
    this.updatePublicMenuData()
    // this.updatePersonalData_baseOn_UserAuthStatus()
  },
  //!!!已抛弃、具体在个人页面中实现
  addApp: function () {
    var that = this
    if (!that.data.on_line) {
      wx.showToast({ title: '请先登陆', icon: null })
      return
    }
    wx.navigateTo({
      url: '../applist/applist?userMenu=' + JSON.stringify(that.data.personal_grids),
    })
  },
  //!!!已抛弃、具体在个人页面中实现，删除用户关注的应用
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
  // !!!已抛弃、具体在个人页面中实现
  onSave: function () {
    var that = this
    var cookie = cookieUtils.getCookieFromStorage()
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
  onShow: function(){ this.onPullDownRefresh() }
});