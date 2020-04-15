// pages/picker/picker.js
const cookieUtil = require('../../utils/cookie.js')
// const shStock = require('../../resources/data/stock/sh-100.js')
// const szStock = require('../../resources/data/stock/sz-100.js')

var allStockData = []
// Array.prototype.push.apply(allStockData, szStock.data)
// Array.prototype.push.apply(allStockData, shStock.data)

const app = getApp()

Page({
  data: {
    isConstellPicker: false,
    isStockPicker: false,
    isCityPicker: false,
    personal: {
      constellation: [],
      city: [],
      stock: []
    },

    allPickerData: {
      allConstellation: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'],
      allStock: allStockData
    }
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    this.setData({
      isConstellPicker: false,
      isCityPicker: false,
      isStockPicker: false
    })
    if (options.type == 'city') {
      this.setData({ isCityPicker: true })
    } else if (options.type == 'stock') {
      this.setData({ isStockPicker: true })
    } else if (options.type == 'constellation') {
      this.setData({ isConstellPicker: true })
    }
    var header = {}
    var cookie = cookieUtil.getCookieFromStorage()
    var that = this
    header.Cookie = cookie
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/user',
      method: 'GET',
      header: header,
      success: function (res) {
        console.log(res.data.data.focus)
        that.setData({ personal: res.data.data.focus })
      }
    })
  },
  onSave: function (isShowModal = true) {
    var header = {}
    var cookie = cookieUtil.getCookieFromStorage()
    header.Cookie = cookie
    var that = this
    wx.request({
      url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/status',
      header: header,
      success: function (res) {
        var data = res.data.data
        if (data.is_authorized != 1) {
          wx.showModal({ title: 'Session过期', showCancel: false, })
        } else {
          wx.request({
            url: app.globalData.serverUrl + app.globalData.apiVersion + '/auth/user',
            method: 'POST',
            data: {
              city: that.data.personal.city,
              stock: that.data.personal.stock,
              constellation: that.data.personal.constellation
            },
            header: header,
            success: function (res) {
              console.log(res)
              wx.showToast({ title: '保存成功', })
            }
          })
        }
      }
    })
  },
  //星座picker变更
  bindConstellationPickerChange: function (e) {
    console.log(e)
    console.log('constellPick发生选择改变，携带值为', e.detail.value)
    var newItem = this.data.allPickerData.allConstellation[e.detail.value]
    var newData = this.data.personal.constellation
    //去重,查看newData是否包含newItem，包含则返回0，不包含则返回-1
    if (newData.indexOf(newItem) > -1) //0>-1,包含不作为
      return
    console.log('newData', newData)
    console.log('newItem', newItem)
    newData.push(newItem)
    var newPersonalData = this.data.personal
    newPersonalData.constellation = newData
    this.setData({ personal: newPersonalData })
  },
  //股票picker变更
  bindStockPickerChange: function (e) {
    console.log(e)
    console.log(e.detail)
    console.log(e.detail.value)
    var newItem = this.data.allPickerData.allStock[e.detail.value]
    var newData = this.data.personal.stock
    //去重
    console.log('newItem:', newItem)
    console.log('newData:', newData)
    for (var i = 0; i < newData.length; i++) {
      if (newData[i].name == newItem.name && newData.code == newItem.code) {
        console.log('already exists.')
        return
      }
    }
    newData.push(newItem)
    var newPersonalData = this.data.personal
    newPersonalData.stock = newData
    this.setData({ personal: newPersonalData })
  },
  //城市picker变更
  bindRegionPickerChange: function (e) {
    console.log('cityPicker发生选择改变，携带值为：', e.detail.value)
    var pickerValue = e.detail.value
    var newItem = {
      province: pickerValue[0],
      city: pickerValue[1],
      area: pickerValue[2]
    }
    var newData = this.data.personal.city
    //去重
    for (var i = 0; i < newData.length; i++) {
      if (newItem.area == newData[i].area && newItem.province == newData[i].province) {
        console.log('already exists.')
        return
      }
    }
    newData.push(newItem)
    var newPersonalData = this.data.personal
    newPersonalData.city = newData
    this.setData({ personal: newPersonalData })
  },
  //删除列表元素
  deleteItem: function (e) {
    console.log(e)
    var that = this
    var deleteType = e.currentTarget.dataset.type
    var deleteIndex = e.currentTarget.dataset.index
    console.log('delete type:' + deleteType)
    console.log('detete index:', deleteIndex)
    var personalData = this.data.personal
    wx.showModal({
      title: '确认删除此项吗?',
      content: '确认删除此项吗?',
      showCancel: true,
      success: function (res) {
        console.log(res)
        if (res.confirm) {
          if (deleteType == 'stock') {
            /**
             * splice()用法：
             *（1）删除：splice(1,2) #从第1项开始删除，删除2项即停
             * (2）插入：splice(1,0,"one","two") #从位置1开始插入one河two
             * (3) 替换：splice(2,1,"one","two") #删除第二项，从第二项开始插入one和two
             */
            personalData.stock.splice(deleteIndex, 1)
          } else if (deleteType == 'constellation') {
            personalData.constellation.splice(deleteIndex, 1)
          } else if (deleteType == 'city') {
            personalData.city.splice(deleteIndex, 1)
          }
          that.setData({ personal: personalData })
          that.onSave(false)
        }
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