from django.contrib import admin
from .models import Ldns
import hashlib
# Register your models here.


@admin.register(Ldns)
class LandnsAppAdmin(admin.ModelAdmin):
    fields = ['owner', 'domain', 'address']

    def save_model(self, request, obj, form, change):
        src = obj.domain
        ldnsid = hashlib.md5(src.encode('utf8')).hexdigest()
        obj.ldnsid = ldnsid
        super().save_model(request, obj, form, change)
