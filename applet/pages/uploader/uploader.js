// pages/uploader/uploader.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    needUploadFiles: [],
  },
  //选择文件(图片)
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          needUploadFiles: that.data.needUploadFiles.concat(res.tempFilePaths)
        });
      }
    })
  },
  //确认上传
  uploadFiles: function(){
    var that = this
    for (var i =0;i<that.data.needUploadFiles.length;i++){
      var filePath = that.data.needUploadFiles[i]
      wx.uploadFile({
        url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/clamav/scanfile?scantype=contscan_file',
        filePath: filePath,
        name: 'clamavscan',
        success: function(res){
          console.log(res)
        }
      })
      wx.showToast({ title: '上传成功', }) 
    } 
    that.setData({ needUploadFiles: [] })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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