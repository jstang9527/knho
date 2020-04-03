// pages/clamav/clamav.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    version: 'ClamAV 0.101.4/25756/Thu Mar 19 13:11:06 2020',
    allClamavFileId: [],
    allMultiClamdId: [],
    clusterReport: [],
    fileReport: [],
    isCurrentPage: true,
    myintervalid: '',
  },

  onNavigatorTap: function(event){
    var that = this
    var navigatorType = event.currentTarget.dataset.type
    if (navigatorType == 'uploadFilePlan'){
      //跳转到上传页面
      wx.navigateTo({ url: '../uploader/uploader?type=' + navigatorType })
    }else if (navigatorType == 'fileDetails'){
      //跳转到指定task详情页面
      var dataIndex = event.currentTarget.dataset.index
      wx.navigateTo({ url: '../details/details?type=' + navigatorType + '&task_id=' + that.data.fileReport[dataIndex].task_id })
      
    }else if (navigatorType == 'moreFilePlan'){
      //跳转到文件报告列表页
    }else if (navigatorType == 'pushClusterPlan'){
      //跳转到任务定制页面
      wx.navigateTo({ url: '../plan/plan', })
    }else if (navigatorType == 'clusterDetails'){
      //跳转到指定task详情页面
      var dataIndex = event.currentTarget.dataset.index
      wx.navigateTo({ url: '../details/details?type=' + navigatorType + '&task_id=' + that.data.clusterReport[dataIndex].task_id }) 
    }else if (navigatorType == 'moreClusterPlan'){
      //跳转到集群扫描报告列表页
    }
  },
  //获取任务所有task_id列表后，再去更新报告
  main: function(){
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/clamav/taskid_list?type=clamavfileid',
      success: function (res) { //taskId列表不为空,则更新file报告
        var array = res.data.data
        if (array != 'None') {
          that.refreshReport('file', array, that.data.fileReport)
        }
        wx.request({
          url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/clamav/taskid_list?type=multiclamdid',
          success: function (res) {
            var array = res.data.data
            if (array != 'None') { // taskId列表不为空, 则更新cluster报告
              that.refreshReport('cluster',  array, that.data.clusterReport)
            }
          },
        })
      },
    })
  },

  //根据ID获取扫描报告, 周期性执行, SUCCESS状态的必须跳过
  refreshReport: function (reportType, allTaskId, oldReport){
    var that = this
    for (var i=0;i<allTaskId.length;i++){
      var existInReport = 1  //0表示存在
      var task_id = allTaskId[i]
      //查找该id是否已有报告
      for (var report_index=0;report_index<oldReport.length;report_index++){
        var reportItem = oldReport[report_index]
        if (reportItem.task_id == task_id){ //找到存在，标记0
          console.log('当前页面有这个报告，让我看看他的状态', reportItem.status)
          existInReport = 0
          if (reportItem.status == 'PENDING'){
            console.log('他需要被更新', reportItem.status)  
            this.updateItemData(reportType, report_index, oldReport, task_id)
          }
          break
        }
      }
      //没有进入上面的for,新数据插入
      if (existInReport) { that.insertItemData(reportType, oldReport, task_id) }
    }
  },
  //监测status是否从Pending->Success，是的话替换数据Item
  updateItemData: function (reportType, report_index ,oldReport, task_id){
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/clamav/task/' + task_id + '/',
      success: function(res){
        var itemData = res.data.data
        if (itemData.status == 'SUCCESS'){ 
          oldReport[report_index] = itemData
          console.log('更新后:',oldReport)
          if (reportType == 'file') { that.setData({ fileReport: oldReport })}
          else { that.setData({ clusterReport: oldReport }) }
        }
      }
    })
  },
  //插入到fileReport列表
  insertItemData: function (reportType, oldReport, task_id){
    var that = this
    console.log('我是新数据')
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/clamav/task/' + task_id + '/',
      success: function (res) {
        oldReport.push(res.data.data)
        if (reportType == 'file') { that.setData({ fileReport: oldReport }) }
        else { that.setData({ clusterReport: oldReport }) }
      }
    })
  },
  //更新病毒库版本
  updateVersion:function(){
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion +'/service/clamav/version',
      success: function(res){
        that.setData({version: res.data.data})
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.main()
    that.updateVersion()
  },

  onPullDownRefresh: function () {
    var that = this
    that.main()
  },

  onShow: function () {
    // 页面显示
    //周期为：2秒 的周期定时器
    var that = this;
    that.data.myintervalid = setInterval(function () {
      that.main()
    }, 2000)
  },

  onHide: function () {
    // 页面隐藏
    //关闭 周期为：2秒 的周期定时器
    clearInterval(this.data.myintervalid);
  },

  onUnload: function () {
    // 页面关闭
    //关闭 周期为：2秒 的周期定时器
    clearInterval(this.data.myintervalid);
  },

})