// pages/blog/blog.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curNav: 0,
    category: ['Kafka','K8s','LB','CDN','Prometheus'], // blog所有类目
    articles: [
      {article_id: 1, title: 'kafka原理'},
      {article_id: 2, title: 'kafka安装'}
    ], //这个是根据类目查询对应文章列表, 后台根据时间倒序排列
  },
  switchRightTab: function(e){
    var that = this
    var id = e.target.dataset.id
    if(id == that.data.curNav){ console.log('当前页'); return }
    else {
      that.setData({ curNav: id})
      that.queryArticles()
    }
  },
  //查询blog所有类别,只加载一次
  queryCategory: function(){
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/blog/category/all',
      success: function(res){
        that.setData({category: res.data.data})
        //加载第一类别文章
        that.queryArticles()
      }
    })
  },
  //查询该类别的所有文章，不会查内容
  queryArticles: function(){
    var that = this
    var index = that.data.curNav
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion +'/blog/articles?category=' + that.data.category[index],
      success: function(res){
        that.setData({articles: res.data.data})
      }
    })
  },
  //跳转到文章详情页
  articleDetail: function(e){
    var that = this
    var articleIndex = e.currentTarget.dataset.index
    var article_id = that.data.articles[articleIndex].article_id
    wx.navigateTo({ url: '../article/article?article_id=' +  article_id})
  },
  onLoad: function (options) {
    var that = this
    that.queryCategory()
  
  },
  onShow: function () {},
  onPullDownRefresh: function () {},
})