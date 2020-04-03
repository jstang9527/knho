from django.urls import path
from landns import views

urlpatterns = [
    # path('weather_old', weather.weather),
    path('all', views.all_record),
    path('query', views.query_record),
    path('user', views.UserLdns.as_view())
]
