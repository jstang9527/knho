var wxCharts = require('../../thirdpart/wxcharts.js');
var promUtils = require('../../utils/guage.js')
var app = getApp();
var cpuRingChart = null;
var memRingChart = null;
var diskRingChart = null;
var lineChart = null;
Page({
  data: {
    uptime: '4天',  //在线时间 
    cons: '8个',  //容器数
    cpuload: { one: '1.2', five: '3.6', fifteen: '2.4' },
    memUsage: '',
    memTotal: '',
    diskUsage: '',
    diskTotal: '',
    hostList: [],
    currentHost: 'localhost',
    allCircle: {
      cpuRing: {
        windowWidth: 320,
        name: 'cpuRing', canvasId: 'cpuCanvas',
        subtitle: { name: 'CPU', color: '#666666', fontSize: 15 },
        title: { name: '90.32%', color: '#FFA54F', fontSize: 20 },
        series: [{ name: '空闲', data: 10, stroke: false, }, { name: '已用', data: 90, stroke: false }]

      },
      memRing: {
        windowWidth: 320,
        name: 'memRing', canvasId: 'memCanvas',
        subtitle: { name: 'MEM', color: '#666666', fontSize: 15 },
        title: { name: '50.12%', color: '#FFA54F', fontSize: 20 },
        series: [{ name: '空闲', data: 50, stroke: false, }, { name: '已用', data: 50, stroke: false }]
      },
      diskRing: {
        windowWidth: 320,
        name: 'diskRing', canvasId: 'diskCanvas',
        subtitle: { name: 'Disk', color: '#666666', fontSize: 15 },
        title: { name: '60.12%', color: '#FFA54F', fontSize: 20 },
        series: [{ name: '空闲', data: 40, stroke: false, }, { name: '已用', data: 60, stroke: false }]
      }
    }
  },
  onLoad: function (e) {
    var that = this
    //初始化画布宽度
    var windowWidth = wx.getSystemInfoSync().windowWidth
    var allCircle = that.data.allCircle
    allCircle.cpuRing.windowWidth = windowWidth - windowWidth * 0.04
    allCircle.memRing.windowWidth = windowWidth / 2 - windowWidth * 0.03
    allCircle.diskRing.windowWidth = windowWidth / 2 - windowWidth * 0.03
    that.setData({ allCircle: allCircle })
    //初始化数据源
    that.upDataCircle()
    console.log('初始化数据源，第一次哦')
  },
  onReady: function () {
    console.log('我是ready')
    //onload初次化数据后执行绘画画布，仅需一次，后续数据更新用updateData
    var that = this
    var allCircle = that.data.allCircle
    var cpuRing = allCircle.cpuRing
    var memRing = allCircle.memRing
    var diskRing = allCircle.diskRing
    cpuRingChart = that.modelCircleCanvas(cpuRingChart, cpuRing.canvasId, cpuRing.subtitle, cpuRing.title, cpuRing.series, cpuRing.windowWidth)
    memRingChart = that.modelCircleCanvas(memRingChart, memRing.canvasId, memRing.subtitle, memRing.title, memRing.series, memRing.windowWidth)
    diskRingChart = that.modelCircleCanvas(diskRingChart, diskRing.canvasId, diskRing.subtitle, diskRing.title, diskRing.series, diskRing.windowWidth)


    that.canvasLine1(cpuRing.windowWidth / 0.96)
    that.canvasLine2(cpuRing.windowWidth / 0.96)
  },
  //更新圆的数据源
  upDataCircle: function () {
    var that = this
    var hostname = that.data.currentHost
    promUtils.getUptime(app, hostname).then(function (data) { that.setData({ uptime: data }) })
    promUtils.getContainers(app, hostname).then(function (data) { that.setData({ cons: data }) })
    var allCircle = that.data.allCircle
    promUtils.getCpuGuage(app, hostname).then(function (data) {
      allCircle.cpuRing.title.name = data + '%'
      allCircle.cpuRing.series[0].data = 100 - data  //free
      allCircle.cpuRing.series[1].data = data * 1
    })
    promUtils.getCpuloadGuage(app, hostname).then(function (data) {
      var cpuload = { one: data.one, five: data.five, fifteen: data.fifteen }
      that.setData({ cpuload: cpuload })
    })
    promUtils.getMemGuage(app, hostname).then(function (data) {
      allCircle.memRing.title.name = data.usagePercent + '%'
      allCircle.memRing.series[0].data = data.memTotal - data.usage  //free
      allCircle.memRing.series[1].data = data.usage
      that.setData({ memTotal: data.memTotal })
    })
    promUtils.getDiskGuage(app, hostname).then(function (data) {
      allCircle.diskRing.title.name = data.usagePercent + '%'
      allCircle.diskRing.series[0].data = data.diskTotal - data.usage  //free
      allCircle.diskRing.series[1].data = data.usage
      that.setData({ diskTotal: data.diskTotal })
    })
    that.setData({ allCircle: allCircle })
    console.log('更新圆的数据源')
  },
  //刷新画布
  updateDataCircle: function () {
    var that = this
    var allCircle = that.data.allCircle
    var cpuRing = allCircle.cpuRing
    var memRing = allCircle.memRing
    var diskRing = allCircle.diskRing
    var cpuSeries = cpuRing.series
    var memSeries = memRing.series
    var diskSeries = diskRing.series
    cpuRingChart.updateData({ title: { name: cpuRing.title.name }, subtitle: { color: '#666666' }, series: cpuSeries });
    memRingChart.updateData({ title: { name: memRing.title.name }, subtitle: { color: '#666666' }, series: memSeries });
    diskRingChart.updateData({ title: { name: diskRing.title.name }, subtitle: { color: '#666666' }, series: diskSeries });
    console.log('刷新圆画布')
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
    setTimeout(() => { canvasObj.stopAnimation(); }, 1000);
    return canvasObj
  },


  // 测试更换主机
  changeHost: function (e) {
    var that = this
    that.setData({ currentHost: '47.92.255.39' })
    wx.showModal({
      title: '已更换' + that.data.currentHost,
      content: '将在15秒后更新数据',
      showCancel: false,
      confirmColor: 'skyblue',
    })
  },

  //线
  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  createSimulationData: function () {
    var categories = [];
    var data = [];
    for (var i = 0; i < 10; i++) {
      categories.push('2016-' + (i + 1));
      data.push(Math.random() * (20 - 10) + 10);
    }
    // data[4] = null;
    return {
      categories: categories,
      data: data
    }
  },
  updateData: function () {
    var simulationData = this.createSimulationData();
    var series = [{
      name: '成交量1',
      data: simulationData.data,
      format: function (val, name) {
        return val.toFixed(2) + '万';
      }
    }];
    lineChart.updateData({
      categories: simulationData.categories,
      series: series
    });
  },
  //容器CPU
  canvasLine1: function (windowWidth) {
    var simulationData = this.createSimulationData();
    lineChart = new wxCharts({
      canvasId: 'lineCanvas1',
      type: 'line',
      categories: simulationData.categories,
      animation: true,
      background: '#333333', //f5f5f5
      series: [{
        name: '变量1',
        data: simulationData.data,
        format: function (val, name) { return val.toFixed(2) + '万'; }
      }, {
        name: '变量2',
        data: [2, 0, 0, 3, null, 4, 0, 0, 2, 0],
        format: function (val, name) { return val.toFixed(2) + '万'; }
      }],
      xAxis: { disableGrid: true },
      yAxis: { title: '成交金额 (万元)', format: function (val) { return val.toFixed(2); }, min: 0 },
      width: windowWidth * 0.96,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: { lineStyle: 'curve', legendTextColor: 'white' }
    });
  },
  //容器内存
  canvasLine2: function (windowWidth) {
    var simulationData = this.createSimulationData();
    lineChart = new wxCharts({
      canvasId: 'lineCanvas2',
      type: 'line',
      categories: simulationData.categories,
      animation: true,
      background: '#333333', //f5f5f5
      series: [{
        name: '变量1',
        data: simulationData.data,
        format: function (val, name) { return val.toFixed(2) + '万'; }
      }, {
        name: '变量2',
        data: [2, 0, 0, 3, null, 4, 0, 0, 2, 0],
        format: function (val, name) { return val.toFixed(2) + '万'; }
      }],
      xAxis: { disableGrid: true },
      yAxis: { title: '成交金额 (万元)', format: function (val) { return val.toFixed(2); }, min: 0 },
      width: windowWidth * 0.96,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: { lineStyle: 'curve', legendTextColor: 'white' }
    });
  },

  onShow: function () {
    // 页面显示
    //周期为：2秒 的周期定时器
    var that = this;
    that.data.myintervalid = setInterval(function () {
      that.upDataCircle() //请求数据并更新全局Circle数据
      that.updateDataCircle()  //从全局数据更新Circle画布
    }, 3000)
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
});