const wxCharts = require('../../thirdpart/wxcharts.js');
const promUtils = require('../../utils/guage.js')
const app = getApp();
var cpuRingChart = null;
var memRingChart = null;
var diskRingChart = null;
var ccpuLineChart = null;
var cmemLineChart = null;
Page({
  data: {
    uptime: '4天',  //在线时间 
    cons: '8个',  //容器数
    cpuload: { one:'1.2', five:'3.6', fifteen:'2.4'},
    firstCpuRing: true,  //判断是初始加载还是二次刷新
    firstMemRing: true,  //因为初始加载是准备画布画图
    firstDiskRing: true, // 二次刷新是更新数据而已
    firstCCpuLine: true,
    firstCMemLine: true,
    currentHost: 'localhost',
    hostList: ['All'],
    pageWindowWidth: 414,
    allCircle: {
      cpuRing: {
        windowWidth: 320, name: 'cpuRing', canvasId: 'cpuCanvas',
        subtitle: { name: 'CPU', color: '#666666', fontSize: 15 },
        title: { name: '90.32%', color: '#FFA54F', fontSize: 20 },
        series: [{ name: '空闲', data: 10, stroke: false, }, { name: '已用', data: 90, stroke: false }]

      },
      memRing: {
        windowWidth: 320, name: 'memRing', canvasId: 'memCanvas',
        subtitle: { name: 'MEM', color: '#666666', fontSize: 15 },
        title: { name: '50.12%', color: '#FFA54F', fontSize: 20 },
        series: [{ name: '空闲', data: 50, stroke: false, }, { name: '已用', data: 50, stroke: false }]
      },
      diskRing: {
        windowWidth: 320, name: 'diskRing', canvasId: 'diskCanvas',
        subtitle: { name: 'Disk', color: '#666666', fontSize: 15 },
        title: { name: '60.12%', color: '#FFA54F', fontSize: 20 },
        series: [{ name: '空闲', data: 40, stroke: false, }, { name: '已用', data: 60, stroke: false }]
      }
    },
    currentInterval: 'Last 10 minutes',
    intervalNameList: ['Last 10 minutes', 'Last 30 minutes', 'Last 1 hour', 'Last 6 hours', 'Last 12 hours', 'Last 24 hours', 'Last 3 days','Last 7 days'],
    interval: 600, //10m
    intervalList: [600,1800,3600,3600*6,3600*12,3600*24,3600*24*3,3600*24*7],//10m,30m,1h,6h,12h,24h,3d,7d 
    yAxisData: ['15:00', '15:01', '15:02', '15:03', '15:04', '15:05', '15:06', '15:07', '15:08', '15:09'],
    allLine:{
      conCpu: {
        windowWidth: 414, name: 'conCpu', canvasId: 'cCpuLine', yAxis:{ title: '单位(%)', fontColor: '#cccccc', titleFontColor: '#cccccc', format: function (val) { return val.toFixed(2); }, min: 0 },
        series: [{
          name: 'grafana',
          data: [0.8, 1.9, 2.1, 3.6, 7.2, 12.3, 16.9, 19.6, 21.8, 11.3], // Y值
          format: function (val, name) { return val.toFixed(2) + '%'; }
        },{
          name: 'clamd',
          data: [23.8, 21.9, 15.1, 13.6, 7.2, 2.3, 6.9, 1.6, 1.8, 1.3], // Y值
          format: function (val, name) { return val.toFixed(2) + '%'; }
        }]
      },
      conMem: {
        windowWidth: 414, name: 'conMem', canvasId: 'cMemLine', yAxis: { title: '单位(M)', fontColor: '#cccccc', titleFontColor: '#cccccc', format: function (val) { return val.toFixed(2); }, min: 0 },
        series: [{
          name: 'grafana',
          data: [33.8, 31.9, 32.1, 33.6, 37.2, 32.3, 46.9, 39.6, 31.8, 31.3], // Y值
          format: function (val, name) { return val.toFixed(2) + 'M'; }
        },
        {
          name: 'cadvisor',
          data: [13.8, 11.9, 5.1, 13.6, 17.2, 12.3, 16.9, 1.6, 1.8, 1.3], // Y值
          format: function (val, name) { return val.toFixed(2) + 'M'; }
        }
        ]
      }
    }
  },
  
  bindHostPickerChange: function(e){
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({ currentHost: this.data.hostList[e.detail.value] })
    console.log(this.data.currentHost)
    wx.showModal({
      title: '已切换至'+this.data.currentHost,
      content: '将在下次刷新时更新数据',
      showCancel: false
    })
  },
  bindTimePickerChange: function(e){
    this.setData({ 
      currentInterval: this.data.intervalNameList[e.detail.value],
      interval: this.data.intervalList[e.detail.value]
    })
    console.log(this.data.interval, this.data.currentInterval)
    wx.showModal({
      title: '已切换至'+ this.data.currentInterval,
      content: '将在下次刷新时更新数据',
      showCancel: false
    })
  },
  getHostList: function(){
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/prom/host/list',
      success: function (res) {
        var list = res.data.data
        var data = []
        for (var i = 0; i < list.length; i++) { data.push(list[i].instance) }
        that.setData({hostList: data})
      }
    })
  },


  onLoad: function(e){
    var that = this
    //初始化画布宽度
    var windowWidth = wx.getSystemInfoSync().windowWidth
    var allCircle = that.data.allCircle
    allCircle.cpuRing.windowWidth = windowWidth - windowWidth*0.04
    allCircle.memRing.windowWidth = windowWidth/2 - windowWidth*0.03
    allCircle.diskRing.windowWidth = windowWidth/2 -windowWidth*0.03
    that.setData({ allCircle: allCircle, pageWindowWidth: allCircle.cpuRing.windowWidth})
    
    that.getHostList()  // 获取主机列表，无需即时响应
    //两个异步函数，请求后台并画图
    that.upDataCircleAndDrawing()
    that.upDataAndDrawingCPULine()
    that.upDataAndDrawingMEMLine()
  },
  
  //谁更新完就画[刷]谁, (promise间异步请求数据，异步内部promise同步画图)
  upDataCircleAndDrawing: function(){
    var that = this
    var hostname = that.data.currentHost
    //===================主机饼图===========================
    var allCircle = that.data.allCircle
    var cpuRing = allCircle.cpuRing
    var memRing = allCircle.memRing
    var diskRing = allCircle.diskRing
    //1请求后台Uptime、容器数量、CPU负载数据;
    promUtils.getUptime(app, hostname).then(function (data) { that.setData({ uptime: data }) })
    promUtils.getContainers(app, hostname).then(function(data){ that.setData({ cons: data }) })
    promUtils.getCpuloadGuage(app, hostname).then(function (data){that.setData({cpuload: {one: data.one,five: data.five,fifteen: data.fifteen}})})
    //2请求后台hostCPU数据成功后画Circle图;
    promUtils.getCpuGuage(app, hostname).then(function (data) {
      cpuRing.title.name = data + '%', cpuRing.series[0].data = 100 - data, cpuRing.series[1].data = data * 1
      that.setData({ allCircle: allCircle })
      if(that.data.firstCpuRing){
        console.log('首次画HostCPU图, 很耗时间')
        cpuRingChart = that.modelCircleCanvas(cpuRingChart, cpuRing.canvasId, cpuRing.subtitle, cpuRing.title, cpuRing.series, cpuRing.windowWidth)
        console.log('HostCPU图 ....OK')
        that.setData({firstCpuRing: false})
      }else{
        console.log('刷新HostCPU图')
        that.refreshCircleData('cpu')
      }
    })
    //3请求后台hostMEM数据成功后画Circle图;
    promUtils.getMemGuage(app, hostname).then(function (data) {
      memRing.title.name = data.usagePercent + '%'
      if (data.memTotal > 0){
        memRing.series[0].data = data.memTotal - data.usage
        memRing.series[1].data = data.usage
      }else{ memRing.series[0].data = 100, memRing.series[1].data = 0 }
      
      that.setData({ allCircle: allCircle })
      if(that.data.firstMemRing){
        console.log('首次画HostMEM图， 很耗时间')
        memRingChart = that.modelCircleCanvas(memRingChart, memRing.canvasId, memRing.subtitle, memRing.title, memRing.series, memRing.windowWidth)
        console.log('HostMEM图 ....OK')
        that.setData({firstMemRing: false})
      }else{
        console.log('刷新HostMEM图')
        that.refreshCircleData('mem')
      }
    })
    //4请求后台hostDisk数据成功后画Circle图
    promUtils.getDiskGuage(app, hostname).then(function (data) {
      diskRing.title.name = data.usagePercent + '%'
      if(data.diskTotal > 0){
        diskRing.series[0].data = data.diskTotal - data.usage
        diskRing.series[1].data = data.usage
      }else{ diskRing.series[0].data = 100, diskRing.series[1].data = 0 }
      
      that.setData({ allCircle: allCircle })
      if(that.data.firstDiskRing){
        console.log('首次画HostDisk图， 很耗时间')
        diskRingChart = that.modelCircleCanvas(diskRingChart, diskRing.canvasId, diskRing.subtitle, diskRing.title, diskRing.series, diskRing.windowWidth)
        console.log('HostDisk图 ....OK')
        that.setData({firstDiskRing: false})
      }else{
        console.log('刷新HostDisk图')
        that.refreshCircleData('disk')
      }
    })
  },
 
  //从后台折线图数据后, 画[刷]线图
  upDataAndDrawingCPULine: function(){
    let that = this
    promUtils.getCCpuMatrix(app, that.data.currentHost, that.data.interval).then(function (data) {
      var cpuSeries = []
      var allLine = that.data.allLine
      // if (data.con_value.length == 0){ console.log('无数据'); return}
      for (var i = 0; i < data.con_value.length; i++) {
        cpuSeries.push({ name: data.con_value[i].name, data: data.con_value[i].data, format: function (val, name) { return val.toFixed(2) + '%'; } })
      }
      allLine.conCpu.series = cpuSeries
      that.setData({ yAxisData: data.yAxis_data, allLine: allLine })  //更新全局数据
      if(that.data.firstCCpuLine){  //要从全局数据拿值
        var allLine = that.data.allLine
        var categories = that.data.yAxisData
        ccpuLineChart = that.modelLineCanvas(ccpuLineChart, allLine.conCpu.canvasId, categories, cpuSeries, that.data.pageWindowWidth, allLine.conCpu.yAxis)
        that.setData({firstCCpuLine: false})
      }else{ that.refreshLineData('cpu') }
    })
  },
  upDataAndDrawingMEMLine: function() {
    let that = this
    promUtils.getCMemMatrix(app, that.data.currentHost, that.data.interval).then(function (data) {
      let memSeries = []
      let allLine = that.data.allLine
      // if (data.con_value.length == 0){ console.log('无数据'); return}
      for (var i = 0; i < data.con_value.length; i++) {
        memSeries.push({ name: data.con_value[i].name, data: data.con_value[i].data, format: function (val, name) { return val.toFixed(2) + 'M'; } })
      }
      allLine.conMem.series = memSeries
      that.setData({ yAxisData: data.yAxis_data, allLine: allLine })
      if (that.data.firstCMemLine) {
        let categories = that.data.yAxisData
        cmemLineChart = that.modelLineCanvas(cmemLineChart, allLine.conMem.canvasId, categories, memSeries, that.data.pageWindowWidth, allLine.conMem.yAxis)
        that.setData({ firstCMemLine: false })
      } else { that.refreshLineData('mem') }
    })
  },

  //这个是二次实时刷新数据，刷新圆画布
  refreshCircleData: function (circleType) {
    var that = this
    if (circleType == 'cpu'){
      var cpuRing = that.data.allCircle.cpuRing
      var cpuSeries = cpuRing.series
      cpuRingChart.updateData({ title: { name: cpuRing.title.name }, subtitle: { color: '#666666' }, series: cpuSeries });
    }else if(circleType == 'mem'){
      var memRing = that.data.allCircle.memRing
      var memSeries = memRing.series
      memRingChart.updateData({ title: { name: memRing.title.name }, subtitle: { color: '#666666' }, series: memSeries });
    }else{
      var diskRing = that.data.allCircle.diskRing
      var diskSeries = diskRing.series
      diskRingChart.updateData({ title: { name: diskRing.title.name }, subtitle: { color: '#666666' }, series: diskSeries });
    }
    console.log('刷新'+circleType+'圆画布')
  },
  
  //更换主机
  changeHost: function(e){
    var that = this
    that.setData({ currentHost: '47.92.255.39'})
    wx.showModal({
      title: '已更换'+ that.data.currentHost,
      content: '将在15秒后更新数据',
      showCancel: false,
      confirmColor: 'skyblue',
    })
  },
  //更换时间区间
  changeInterval: function(e){

  },
  
  //这个是二次实时刷新数据，刷新折线图
  refreshLineData: function (lineType) {
    var that = this
    if(lineType=='cpu'){
      ccpuLineChart.updateData({ categories: that.data.yAxisData, series: that.data.allLine.conCpu.series })
    }else{
      cmemLineChart.updateData({ categories: that.data.yAxisData, series: that.data.allLine.conMem.series })
    }
  },
  //圆画布模板
  modelCircleCanvas: function (canvasObj, canvasId, subtitle, title, series, windowWidth) {
    canvasObj = new wxCharts({
      canvasId: canvasId,
      subtitle: subtitle,
      title: title,
      series: series,
      width: windowWidth,
      //after static define
      extra: { ringWidth: 25, pie: { offsetAngle: -125 } },
      disablePieStroke: true,
      animation: true,
      type: 'ring',
      height: 200,
      dataLabel: false,
      legend: false,
      background: '#f5f5f5',
      padding: 0
    });

    canvasObj.addEventListener('renderComplete', () => { console.log(canvasId, 'renderComplete'); });
    setTimeout(() => { canvasObj.stopAnimation(); }, 500);
    return canvasObj
  },
  //折线图模板
  modelLineCanvas: function (lineObj, canvasId, categories, series, windowWidth, yAxis) {
    lineObj = new wxCharts({
      canvasId: canvasId,
      categories: categories,  //变的 x坐标值
      series: series,  //Y坐标值还有其他值的复杂东西
      width: windowWidth * 0.96,
      yAxis: yAxis,
      //以下为静态数据
      animation: true,
      type: 'line',
      background: '#333333', //f5f5f5
      xAxis: { disableGrid: true, fontColor: '#cccccc'},
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: { lineStyle: 'curve', legendTextColor: 'white' }
    });
    lineObj.addEventListener('renderComplete', () => { console.log(canvasId, 'renderComplete'); });
    setTimeout(() => { lineObj.stopAnimation(); }, 1000);
    return lineObj
  },
  //触摸折线图
  touchHandler: function (e) {
    var dataType = e.currentTarget.dataset.type  //cpu|mem
    // console.log(lineChart.getCurrentDataIndex(e));
    if (dataType == 'cpu') {
      ccpuLineChart.showToolTip(e, {
        // background: '#7cb5ec',
        format: function (item, category) { return category + ' ' + item.name + ':' + item.data }
      });
    }
    else {
      cmemLineChart.showToolTip(e, {
        // background: '#7cb5ec',
        format: function (item, category) { return category + ' ' + item.name + ':' + item.data }
      });
    }
  },
  onShow: function () {
    var that = this;
    that.data.myintervalid = setInterval(function () {
      that.upDataCircleAndDrawing()
      that.upDataAndDrawingCPULine()
      that.upDataAndDrawingMEMLine()
    }, 15000)
  },

  onHide: function () { clearInterval(this.data.myintervalid); },
  onUnload: function () { clearInterval(this.data.myintervalid); }
});