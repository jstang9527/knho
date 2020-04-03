from django.urls import path
from authorization import views

urlpatterns = [
    # path('weather_old', weather.weather),
    path('test', views.test_session),
    path('test2', views.test_session2),
    path('authorize', views.authorize, name='authorize'),
    path('user', views.UserView.as_view()),
    path('logout', views.logout),
    path('status', views.get_status)
]
