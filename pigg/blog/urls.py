from django.urls import path
from blog import views

urlpatterns = [
    # path('test', views.article_content),
    path('category/all', views.all_category),
    path('articles', views.article_category),  # 需要url提供?category='Kafka'
    path('article', views.get_article),
]
