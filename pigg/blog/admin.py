from django.contrib import admin
from .models import Article, Category


# admin.site.register(Article)
admin.site.register(Category)


@admin.register(Article)
class BlogArticleAdmin(admin.ModelAdmin):
    exclude = ['article_id']
