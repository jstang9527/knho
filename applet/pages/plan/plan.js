// pages/plan/plan.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    registerClamdIP:['192.168.27.128','172.31.50.138','127.0.0.1'],
    dirPath: ['/','/bin','/boot','/dev','/etc','/home','/lib','/lib64','/media','/mnt','/opt','/proc','/root','/run','/sbin','/srv','/sys','/tmp','/usr','/var'],
    chosenIP:[],
    chosenDirPath:'',
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  onPullDownRefresh: function () {
    var that = this
    console.log(that.data.chosenDirPath)
  },
  getInput: function (e) {
    this.setData({
      chosenDirPath: e.detail.value
    })
  },
  pickerDirPath: function(e){
    var chosenDirPath = this.data.dirPath[e.detail.value]
    this.setData({designDirPath: chosenDirPath, chosenDirPath: chosenDirPath})
  },
  bindIpPickerChange: function(e){
    var newItem = this.data.registerClamdIP[e.detail.value]
    var allData = this.data.chosenIP
    if (allData.indexOf(newItem) > -1){
      return //去重，包含为0，不包含为-1
    }
    allData.push(newItem)
    this.setData({chosenIP: allData})
  },
  deleteItem: function (e) {
    var that = this
    var index = e.currentTarget.dataset.index
    console.log('delete index: ' + index)
    wx.showModal({
      content: "确认删除此项吗？", showCancel: true,
      success: function (res) {
        console.log(res)
        if (res.confirm) {
          var chosenIP = that.data.chosenIP
          chosenIP.splice(index, 1)
          that.setData({ chosenIP: chosenIP })
        }
      }
    })
  },
  onSave: function(){
    if(this.data.chosenIP.length == 0){ wx.showToast({ title: '请选择IP地址', icon: 'none', duration: 2000}) }
    else if(this.data.chosenDirPath == ''){ wx.showToast({ title: '请填写扫描路径', icon: 'none', duration: 2000}) }
    else{
      wx.showLoading({ title: '正在提交...',})
      var data = {'object': {
          'filedir': this.data.chosenDirPath,
          'scantype': 'multiscan_file',
          'ip_list': this.data.chosenIP}
      }
      wx.request({
        url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/clamav/multiscan',
        method: 'POST',
        data: data,
        success: function(res){ wx.hideLoading(), wx.showToast({title: '提交成功', })}
      })
    }
  }
})