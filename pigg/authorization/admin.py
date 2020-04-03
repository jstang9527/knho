import hashlib
from django.contrib import admin
from .models import User
# Register your models here.

# admin.site.register(User)


@admin.register(User)
class AuthorizationUserAdmin(admin.ModelAdmin):
    # 将open_ip属性屏蔽
    exclude = ['open_id']
    

    # 这个只有在web admin页面添加用户才使用。
    def save_model(self, request, obj, form, change):
        src = obj.nickname
        open_id = hashlib.md5(src.encode('utf8')).hexdigest()
        obj.open_id = open_id
        super().save_model(request, obj, form, change)