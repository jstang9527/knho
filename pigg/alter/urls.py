from django.urls import path
from alter import views

urlpatterns = [
    path('test', views.test),
    path('ithreat/top10', views.latest_ithreat_top10),
    path('ithreat/statistics', views.statistics),
]
