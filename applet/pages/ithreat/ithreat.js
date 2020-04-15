import * as echarts from '../../ec-canvas/echarts';
import geoJson from '../../ec-canvas/world.js';
const app = getApp()
const geoCoordMap = require('worldLocation.js')
const geoMap = require('../../utils/ithreat.js')
let myMap = null;

var convertData = function(data) {  //这个函数是获取动态点位置
  var res = [];
  for(var i = 0; i < data.length; i++) {
    var geoCoord = geoCoordMap[data[i].name];
    if(geoCoord) {
      res.push({ name: data[i].name, value: geoCoord.concat(data[i].value) });
    }
  }
  return res;
};
var data = [ { name: 'US', value: 19 },{ name: 'Russia', value: 19 },{ name: 'China', value: 9 },
  { name: 'India', value: 11 },{ name: 'Canada', value: 6 },{ name: 'UK', value: 13 },{ name:'Australia', value: 9},
  {name: 'Greenland', value: 3}, {name: 'Brazil', value:12}, {name: 'Iran', value: 5}, {name: 'Japan', value: 6}
  ];
function initChartMap(canvas, width, height) {
  myMap = echarts.init(canvas, null, { width: width, height: height });
  canvas.setChart(myMap);
  echarts.registerMap("myworld", geoJson);  // 绘制世界地图
  
  var option = {
    tooltip: {  //点击板块弹出的文字框
      trigger: 'item',
      backgroundColor: "#FFF",
      padding: [2,5,0,5],
      extraCssText: 'box-shadow: 2px 2px 10px rgba(21, 126, 245, 0.35);',
      textStyle: {
        fontFamily: "'Microsoft YaHei', Arial, 'Avenir', Helvetica, sans-serif",
        color: '#005dff',  //蓝色字体
        fontSize: 12,
      },
      formatter: `{b} :  {c}`
    },
    visualMap: {  //根据value大小定颜色
      min: 0,
      max: 15,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'], // 文本，默认为数值文本
      calculable: true,
      show: false
    },
    geo: [
      {
        // 地理坐标系组件
        map: "world",
        roam: true, // 可以缩放和平移
        aspectScale: 0.75, // 比例
        layoutSize: width*0.90, // 地图大小
        center:[0, 29.71], //当前视角的中心点，用经纬度表示
        aspectScale:0.75,
        boundingCoords: [[-180, 90], [180, -90]],
        zoom:1,  //视角的缩放比例
        layoutCenter:['50%', '40%'], 
        label: { // 版块上的国家名
          normal: {
            show: false,
            textStyle: { color: "rgba(0, 0, 0, 0.9)", fontSize: '8' }
          },
          emphasis: { color: "#000" }  //被点击时显示的国家名
        },
        itemStyle: { // 图形上的地图区域
          normal: {
            borderColor: "rgba(0,0,0,0.2)", //国家边界线
            areaColor: '#fff' // 所有板块颜色
          },
          emphasis: { areaColor: '#005dff' } // 被点击时板块显示蓝色
        }
      }
    ],
    toolbox: {  //右侧地图保存按钮
      show: false,  // 禁止
      orient: 'vertical',
      left: 'right',
      top: 'center',
      feature: { dataView: { readOnly: false }, restore: {}, saveAsImage: {} }
    },
    series: [
      {
        name: 'world',
        type: 'map',
        mapType: 'myworld',
        geoIndex: 0,  //去掉会显示所有国家名
        roam: true, // 鼠标是否可以缩放
        label: { 
          normal: { show: true , formatter: '{b}', position: 'right', }, 
          emphasis: { show: true } 
        },
        itemStyle: { normal: {color: '#ddb926'} }, //黄色字
        data: data,
      }, 
      {  
        name: 'top5',
        type: 'effectScatter',
        map: 'world',
        mapType: 'myworld',
        geoIndex: 0,
        coordinateSystem: 'geo',
        data: convertData(data.sort(function(a, b) { return b.value - a.value; }).slice(0, 5)),
        showEffectOn: 'render',
        symbolSize: function(val) { return val[2] / 10; },
        rippleEffect: { period: 4, scale: 3, brushType: 'fill' },
        hoverAnimation: true,
        label: {
          normal: {
            formatter: '{b}',
            position: 'right',
            show: true,
            textStyle: { color: "yellow", fontSize: '8' },
            color: "#000"
          }
        },
        itemStyle: { normal: {color: '#f4e925', shadowBlur: 10, shadowColor: '#fff'} },//'#f4e925', 黄色
        zlevel: 0 
      },
    ]
  };
  myMap.setOption(option);
  return myMap
}

Page({
  data: {
    ec: { onInit: initChartMap },
    curMap: 0,
    category: ['攻击者地区分布', '受害者地区分布'],
    rollVictims: [
      { time: "2020-04-13 06:06:36", ip: "113.88.133.18", area: "中国-广东-深圳" },
      { time: "2020-04-12 14:16:17", ip: "14.113.78.47", area: "英国-伦敦" },
      { time: "2020-04-12 15:26:11", ip: "113.96.149.102", area: "俄罗斯-圣彼得堡" },
      { time: "2020-04-12 04:33:13", ip: "18.182.21.169", area: "日本-东京"},
      { time: "2020-04-12 03:06:36", ip: "124.173.72.114", area: "中国-广东-佛山"},
      { time: "2020-04-12 02:55:12", ip: "14.213.12.12", area: "美国-旧金山"},
      { time: "2020-04-12 02:32:39", ip: "21.163.122.214", area: "美国-休斯顿"}, 
    ],
    rollAttacks: [
      { time: "2020-04-13 06:06:36", ip: "221.167.0.31", area: "韩国-庆尚南道-金海市" },
      { time: "2020-04-12 14:16:17", ip: "139.162.122.110", area: "日本-东京" },
      { time: "2020-04-12 15:26:11", ip: "151.229.240.33", area: "英国-苏格兰" },
      { time: "2020-04-12 04:33:13", ip: "197.56.224.73", area: "埃及" },
      { time: "2020-04-12 03:06:36", ip: "45.67.15.101", area: "荷兰-阿姆斯特丹" },
      { time: "2020-04-12 02:55:12", ip: "14.213.12.12", area: "美国-芝加哥" },
      { time: "2020-04-12 02:32:39", ip: "215.74.122.145", area: "印度-德里" },
    ],
    times: 50,
    max: [100, 50],
    data:[
      //攻击者地图数据
      [ { name: 'US', value: 69 },{ name: 'UK', value: 49 },{ name: 'Russia', value: 52 }],
      //受害者地图数据
      [ { name: 'China', value: 69 },{ name: 'Russia', value: 52 },{ name: 'Japan', value: 49 }]
    ]
  },
  //切换地图数据
  switchMapTab: function(e){
    var that = this
    var id = e.target.dataset.id
    if(id == that.data.curMap){ console.log('当前地图'); return }
    else {
      that.setData({ curMap: id})
      that.showDataOnMap()  
    }
  },
  //拉数据并刷新地图
  pullDataAndShowOnMap: function(){
    var that = this
    var max = that.data.max
    var oldData = that.data.data
    geoMap.getMapData(app).then(function (data) {
      max[0] = data.attack_maxtimes
      max[1] = data.suffer_maxtimes
      oldData[0] = data.attack_data
      oldData[1] = data.suffer_data
      that.setData({times: data.times, max: max, data: oldData})
      that.showDataOnMap()
    })
  },
  //显示地图数据，1，切换地图的时候被调用；2promise后被调用
  showDataOnMap: function(){
    console.log('刷新地图数据')
    var that = this
    var curMap = that.data.curMap
    data = that.data.data[curMap]
    var mydata = convertData(data.sort(function(a, b) { return b.value - a.value; }).slice(0, 5))
    console.log('mydata:', mydata)
    var max = that.data.max[curMap]
    console.log('全局数组',data, max)
    myMap.setOption({
      visualMap: {
        max: max
      },
      series: [
        { name: 'world', data: data, },
        { 
          name: 'top5', 
          type: 'effectScatter',
          data: convertData(data.sort(function(a, b) { return b.value - a.value; }).slice(0, 5)),
        }
      ]
    })
  },







  //拉取滚动条记录
  pullRollList: function(){
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/alter/ithreat/top10',
      success: function(res){
        var data = res.data.data
        that.setData({rollAttacks: data.attacks, rollVictims: data.victims})
        // console.log(that.data.rollVictims)
      }
    })
  },

  onLoad: function(){
    this.pullRollList()
    console.log(data)
  },
  delay: function(){
    var that = this
    that.pullDataAndShowOnMap()
    clearInterval(this.data.timer); //清除定时器
    console.log('进行首次延时展示，确保地图内容最新')
  },
  onReady: function(){
    this.data.timer = setInterval(this.delay, 1000)
  },
  onShow: function () {
    // 监听页面显示, 若页面显示则开启周期定时器
    var that = this;
    that.data.myintervalid = setInterval(function () {
      that.pullDataAndShowOnMap()
    }, 60000*5)
  },
  onHide: function () {
    // 监听页面隐藏, 若页面关闭则关闭周期定时器
    clearInterval(this.data.myintervalid);
  },
  onUnload: function () {
    // 监听页面关闭, 若页面关闭则关闭周期定时器
    clearInterval(this.data.myintervalid);
  }
})
