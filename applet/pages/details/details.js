// pages/details/details.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskResult: //单条task_id获得的扫描结果
    {
      task_id: 'e14612c0-4a29-480e-9a22-054470fc6311',
      status: 'SUCCESS',
      result: [
        { //当获取clamd多客户端扫描结果时，会有多条result记录
          ip: "172.31.50.253",
          status: "success",
          version: "ClamAV 0.101.4/25756/Thu Mar 19 13:11:06 2020",
          connstr: "172.31.50.253 connection [ok]",
          scanresult: "{'/opt/clamav/resources/files/ca692b09a0f11531f0ca0a04c677572b': ('FOUND', 'Win.Trojan.Agent-662490')}\n"
        },
        { //文件扫描一个task_id只有一条记录
          ip: "172.31.50.138",
          status: "failed",
          version: "",
          connstr: "172.31.50.138 connection [Error]",
          scanresult: ""
        }
      ]
    },
  },

  /**
   * 只加载单个task_id详情页
   */
  onLoad: function (options) {
    var that = this
    console.log(options.type)
    console.log(options.task_id)
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + "/service/clamav/task/" + options.task_id +'/',
      success: function(res){
        var taskResult = res.data.data
        console.log(taskResult)
        that.setData({taskResult: taskResult})
      }
    })
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