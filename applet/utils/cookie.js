const key = 'cookie'
//从response取Cookie
function getSessionIDFromResponse(res) {
  var cookie = res.header['Set-Cookie']
  console.log('get cookie from response:' + cookie)
  return cookie
}
//将Cookie存储到Storage中
function setCookieToStorage(cookie) {
  try {
    wx.setStorageSync(key, cookie)
  } catch (e) { console.log(e) }
}
//从Storage中取Cookie
function getCookieFromStorage() {
  var value = wx.getStorageSync(key)
  return value
}
//导出即可在外部使用这三个函数
module.exports = {
  setCookieToStorage: setCookieToStorage,
  getCookieFromStorage: getCookieFromStorage,
  getSessionIDFromResponse: getSessionIDFromResponse
}