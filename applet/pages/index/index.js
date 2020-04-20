//index.js
//获取应用实例
const app = getApp()
const cookieUtil = require('../../utils/cookie.js')
const authUtil = require('../../utils/auth.js')

Page({
  data: {
    imgUrls: [
      { link: '', url: '../../resources/tabbar/clamav.png' },
      { link: '', url: '../../resources/tabbar/kbase.png' },
      { link: '', url: '../../resources/tabbar/dns.png' },
    ],
    indicatorDots: false, //小点
    indicatorColor: "white",//指示点颜色
    activeColor: "coral",//当前选中的指示点颜色
    autoplay: true, //是否自动轮播
    interval: 5000, //间隔时间
    duration: 100, //滑动时间
    result: [
      { //当获取clamd多客户端扫描结果时，会有多条result记录
        name: "clamd",
        value: "CPU > 82%",
        timestamp: 1585108806,
      },
      { //当获取clamd多客户端扫描结果时，会有多条result记录
        name: "redis",
        value: "CPU> 32%",
        timestamp: 1585108806,
      },
      { //当获取clamd多客户端扫描结果时，会有多条result记录
        name: "prometheus",
        value: "MEM > 38%",
        timestamp: 1585108806,
      },
    ],
    default_city: { "cities": ["深圳"] },
    isAuthorized: false,
    weatherData: null,
    userInfo: null,
    hasUserInfo: null,
    notice: ['美国新增确诊超3.2万例 累计逾52万例 所有州进入重大灾难状态','轰炸机、预警机、战斗机编队绕台|解放军真的来了',
    '深圳发放2亿元消费券 购车最高可补贴1万元',],
    alter: [
      {'content': 'clamav容器服务的MEM已超过告警阈值20%, 具体值为847M', 'host': '47.92.255.39', 'time': '2020-04-15T18:03:00'},
      {'content': '主机zan71.com的Disk已超过告警阈值80%, 具体值为39.65G', 'host': 'zan71.com', 'time': '2020-04-14T20:44:37'},
      {'content': '主机localhost的CPU已超过告警阈值80%, 具体值为82.62%', 'host': 'localhost', 'time': '2020-04-14T13:18:25'},
    ]
  },
  //获取新闻函数
  pullNews: function() {
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/news/latest',
      success: function(res) {
        that.setData({notice: res.data.data})
      }
    })
  },
  //获取告警
  pullAlter: function() {
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/alter',
      success: function(res) {
        that.setData({alter: res.data.data})
      }
    })
  },
  //获取天气函数
  updateData: function () {
    wx.showLoading({ title: '加载中', })
    var that = this
    var header = {}
    if (that.data.isAuthorized){
      var cookie = cookieUtil.getCookieFromStorage()
      header.Cookie = cookie
      var methord = 'GET'
    } else{
      var methord = 'POST'
    }
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/weather',
      method: methord,
      header: header,
      data: {
        cities: that.data.default_city
      },
      success: function (res) {
        that.setData({ weatherData: res.data.data })
      },
      complete: function() { wx.hideLoading() }
    })
  },
  //下拉刷新,先检查session是否过期，再更新页面数据
  onPullDownRefresh: function () {
    var that = this
    that.updateData()
    var promise = authUtil.getStatus(app)
    promise.then(function (status) {
      if (status) { that.setData({ isAuthorized: true }) } 
      else {
        that.setData({ isAuthorized: false })
        wx.showToast({ title: '请先登陆', icon: 'none' })
      }
    })
  },
  onLoad: function () {
    this.pullNews()
    // this.pullAlter()
    this.onPullDownRefresh()
    if (app.globalData.userInfo){ this.setData({ userInfo: app.globalData.userInfo, hasUserInfo: true}) } 
    else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => { this.setData({ userInfo: res.userInfo, hasUserInfo: true }) }
    } 
    else { // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({ userInfo: res.userInfo, hasUserInfo: true })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({ userInfo: e.detail.userInfo, hasUserInfo: true })
  },
  //告警已读移除
  alreadyReadTab: function(e) {
    var that = this
    var deleteIndex = e.currentTarget.dataset.index
    var alter = that.data.alter
    wx.showModal({
      title: '已读',
      content: '删除该条告警记录',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...', })
          alter.splice(deleteIndex, 1)
          that.setData({ alter: alter })
          wx.hideLoading()
        }
      }
    })
  },
  onShow: function() {
    var that = this
    that.setData({isAuthorized: app.getAuthStatus()})
    console.log(that.data.isAuthorized)
    that.pullAlter()
  }
})
