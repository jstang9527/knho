// pages/weather/weather.js

const app = getApp()
const popularCities = { "cities": ["深圳", "广州", "北京", "上海"] }
Page({
  /**
   * 页面初始数据
   */
  data: {
    isAuhtorized: false,
    weatherData: null,
    cityQuery: null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.updateWeatherData()
  },
  // onShow: function(option){
  //   this.updateWeatherData()
  // },
  updateWeatherData: function () {
    var that = this
    if (that.data.cityQuery) {
      var cities = that.data.cityQuery
    } else {
      var cities = popularCities
    }
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/service/weather',
      method: 'POST',
      data: {
        cities: cities
      },
      success: function (res) {
        var tmpData = res.data.data
        that.setData({ weatherData: tmpData })
        wx.hideLoading()
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.updateWeatherData()
  },
  bindRegionPickerQuery: function (e) {
    console.log('cityPicker发生选择改变，携带值为：', e.detail.value)
    var that = this
    // that.data.cityQuery = e.detail.value.pickerValue[1]
    var pickerValue = e.detail.value
    var newItem = {
      province: pickerValue[0],
      city: pickerValue[1],
      area: pickerValue[2]
    }
    console.log(newItem)
    var data = {
      cities: [newItem.city]
    }
    //data = '{"cities": ["深圳", "广州", "北京", "上海"]}'
    console.log(popularCities)
    console.log(data)
    that.setData({ cityQuery: data })
    that.onLoad()
  }
})