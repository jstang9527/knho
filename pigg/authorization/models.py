# -*- encoding=utf8 -*-
from django.db import models
from apis.models import App


# 在属性中定义索引
# class User(models.Model):
#     # 微信的openid是长度为32的字符串，必须索引
#     open_id = models.CharField(max_length=32, unique=True)
#     # 用户名，可以索引，可作模糊过滤
#     nickname = models.CharField(max_length=256, db_index=True)
#     # 关注的城市
#     focus_cities = models.TextField(default='[]')
#     # 关注的星座
#     focus_constellations = models.TextField(default='[]')
#     # 关注的股票
#     focus_stocks = models.TextField(default='[]')


# 在模型的Meta属性类中定义索引
class User(models.Model):
    # 微信的openid是长度为32的字符串，必须索引
    open_id = models.CharField(max_length=32, unique=True)
    # 用户名，可以索引，可作模糊过滤
    nickname = models.CharField(max_length=256, db_index=True)
    # 关注的城市
    focus_cities = models.TextField(default='[]')
    # 关注的星座
    focus_constellations = models.TextField(default='[]')
    # 关注的股票
    focus_stocks = models.TextField(default='[]')

    # 菜单app,用户可以有多个应用，应用可以被多个用户拥有
    menu = models.ManyToManyField(App)

    class Meta:
        indexes = [
            # models.Index(fields=['nickname']),
            models.Index(fields=['open_id', 'nickname'])  # 组合索引，加快联合查询速度
        ]

    def __str__(self):
        return '%s' % self.nickname
