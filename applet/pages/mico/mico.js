Page({
  data: {
    showDialog: false,
    curNav: 0,
    category: ['服务发布', '控制台'],
    control: 0,
    list: ['服务实例','定时发布','我的模板','热门模板','服务告警','弹性伸缩','高级编排'], 
    articles: [
      {article_id: 1, title: 'kafka原理'},
      {article_id: 2, title: 'kafka安装'}
    ],
  },
  switchRightTab: function(e){
    var that = this
    var id = e.target.dataset.id
    if(id == that.data.curNav){ console.log('当前页'); return }
    else {
      that.setData({ curNav: id})
      // that.queryArticles()
    }
  },
  controlSwitchRightTab: function(e){
    var that = this
    var id = e.target.dataset.id
    if(id == that.data.control){ console.log('当前页'); return }
    else {
      that.setData({ control: id})
      // that.queryArticles()
    }
  },
  onLoad: function(){
    // wx.showModal({
    //   content: '暂未上线',
    //   showCancel: false
    // })
    this.openDialog()
  },


  //未完成提示
  openDialog: function () { this.setData({ istrue: true }) },
  closeDialog: function () { this.setData({ istrue: false }) }
})
