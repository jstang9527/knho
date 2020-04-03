const app = getApp()
const cookieUtil = require('../../utils/cookie.js')
const authUtil = require('../../utils/auth.js')
Page({
  data: {
    dns_ip: '192.168.47.128',
    inputShowed: false,
    inputVal: "",  // 公共查询搜索栏
    result: "",  // 公共查询结果值
    myRecord: [], // 我的解析记录
    isAuthorized: false,  //是否已登录
    postDomain:'',
    postAddress:''
  },
  showInput: function () { this.setData({ inputShowed: true }); },
  hideInput: function () { this.setData({ inputVal: "", inputShowed: false }); },
  clearInput: function () { this.setData({ inputVal: "" }); },
  inputTyping: function (e) { this.setData({ inputVal: e.detail.value }); },
  //获取添加域名解析
  getInput: function (e) {
    var that = this
    var dataType = e.currentTarget.dataset.type
    if (dataType=='domain'){
      that.setData({postDomain: e.detail.value})
    }else{
      that.setData({postAddress: e.detail.value})
    }
  },
  //
  uploadData: function(){
    var that = this
    that.setData({ isAuthorized: app.getAuthStatus() })
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
    var postData = {domain:that.data.postDomain, address: that.data.postAddress}
    header.Cookie = cookie
    wx.showLoading({ title: '处理中...', })
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/dns/user',
      header: header,
      method: 'POST',
      data: {data:postData},
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showModal({ title: res.data.message, content: '', showCancel: false})
      },
      fail: function(res){ wx.showModal({
        title: '插入失败',
        content: 'request was aborted',
      }),wx.hideLoading()}
    })
    that.closeDialog()
  },
  //加载函数
  onLoad: function () {
    var that = this
    that.setData({ isAuthorized: app.getAuthStatus(), })  //控制js页面显示个人dns记录
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl+app.globalData.apiVersion+'/dns/user',
      header: header,
      method: 'GET',
      success: function(res){
        that.setData({myRecord: res.data.data})
      }
    })
  },
  //显示添加页面
  addRecord: function(){
    var that = this
    if (!app.getAuthStatus()){
      wx.showToast({title: '请先登录',icon: 'none'})
      return
    }
    that.openDialog()
  },
  //公共查询，无需认证
  search: function () {
    var that = this
    that.setData({result: ''})
    if (!that.data.inputVal || that.data.inputVal.indexOf(".") <0) {
      wx.showToast({ title: '请正确输入内容！', icon: 'none'})
      return
    }
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/dns/query?domain=' + that.data.inputVal,
      success: function (res) {
        var result = res.data.data
        if (result) { that.setData({ result: result }) }
        else{ wx.showToast({ title: '没有该记录'+ that.data.inputVal, icon: 'none' })}
      }
    })
    that.setData({ inputVal: '' })
  },

  //删除列表元素
  deleteItem: function (e) {
    var that = this
    var deleteIndex = e.currentTarget.dataset.index
    var myRecord = this.data.myRecord
    wx.showModal({
      title: '确认删除此项吗?',
      content: myRecord[deleteIndex].domain,
      showCancel: true,
      success: function (res) {
        if(res.confirm){
          var delDomain = myRecord[deleteIndex].domain
          that.delRecord(delDomain) //删除数据库记录
          //先从前端删除，如果数据库删除不成功会自动刷新该页，获取用户所有记录数据
          myRecord.splice(deleteIndex, 1)
          that.setData({ myRecord: myRecord })
        }
      }
    })
  },
  //删除数据库记录
  delRecord: function(delDomain){
    var that = this
    that.setData({ isAuthorized: app.getAuthStatus(), })
    var cookie = cookieUtil.getCookieFromStorage()
    var header = {}
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/dns/user?domain='+delDomain,
      header: header,
      method: 'DELETE',
      success: function (res) {
        console.log(res)
      }
    })
  },
  onShow: function(){ this.onLoad() },
  onPullDownRefresh: function(){ this.onLoad() },
  openDialog: function () { this.setData({ istrue: true}) },
  closeDialog: function () { this.setData({ istrue: false }) }
});