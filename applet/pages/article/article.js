// pages/article/article.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    author: '架势糖',
    pageview: 101,
    title: 'Kafka SSL配置安装及使用',
    content:[
      {
        brief:'一、Kafka及Zookeeper快速安装配置及测试',
        body: ['非主要内容，详见此篇： https://www.cnblogs.com/wonglu/p/8687488.html']
      },
      {
        brief: '二、Kafka SSL服务端配置',
        body: ['[root@kafka ~]# mkdir -p /root/round1 && cd /root/round1','[root@kafka round1]# /bin/bash test.sh',
          '[root@kafka round1]# vim /opt/kafka_2.11-1.1.0/config/server.properties','listeners = PLAINTEXT://:9092,SSL://:9093','advertised.listeners = PLAINTEXT://本机IP:9092,SSL://本机IP:9093']
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/blog/article?article_id=' + options.article_id,
      success: function(res){
        var data = res.data.data
        that.setData({title:data.title,author: data.author,pageview:data.pageview,content:data.content})
        that.setTopTopic()
      }
    })
  },

  //设置顶部主题
  setTopTopic:function(){
    var that = this
    wx.setNavigationBarTitle({ title: that.data.title })
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