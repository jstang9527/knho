from django.contrib import admin
from .models import App
import hashlib
# Register your models here.
# admin.site.register(App)


# 将App注册到admin模块里面
@admin.register(App)
class ApisAppAdmin(admin.ModelAdmin):
    # exclude = ['appid']
    # 除了可以使用exclude屏蔽某些属性，也可以用fields显示哪些属性
    fields = ['name', 'application', 'category', 'url', 'publish_date', 'desc']

    # 由于appid被屏蔽，而且appid是通过代码制作得到，需要重新相关函数
    # 为何open_id不用？因为appid是主键，必须填写
    def save_model(self, request, obj, form, change):
        src = obj.category + obj.application
        appid = hashlib.md5(src.encode('utf8')).hexdigest()
        obj.appid = appid
        super().save_model(request, obj, form, change)
