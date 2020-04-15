from django.contrib import admin
from .models import Ithreat


@admin.register(Ithreat)
class AlterIthreatAdmin(admin.ModelAdmin):
    exclude = ['ithreat_id']
