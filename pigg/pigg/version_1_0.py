from django.urls import path, include

urlpatterns = [
    path('service/', include('apis.urls')),
    path('auth/', include('authorization.urls')),
    path('dns/', include('landns.urls')),
    path('blog/', include('blog.urls'))
]
