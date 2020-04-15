from django.db import models
from authorization.models import User


# 创建文章类型
class Category(models.Model):
    # id
    category_id = models.AutoField(primary_key=True)
    # 类型名
    name = models.TextField()
    
    def __str__(self):
        return '%s' % self.name


class Article(models.Model):
    # 文章唯一ID，自增主键
    article_id = models.AutoField(primary_key=True)
    # 文章标题
    title = models.CharField(max_length=128)
    # 文章摘要
    brief_content = models.TextField()
    # 文章的主要内容
    content = models.TextField()
    # 文章的发布日期
    # publish_date = models.DateTimeField(auto_now=True)
    publish_date = models.DateTimeField()
    # 热度
    pageview = models.IntegerField()
    # 作者
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    # 分类
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    def to_dict(self):
        return {
            'article_id': self.article_id,
            'title': self.title,
            'brief_content': self.brief_content,
            'content': self.content,
            'publish_date': self.publish_date,
            'pageview': self.pageview,
            'author': self.author
        }

    def __str__(self):
        return '%s 【作者:%s】' % (self.title, self.author)

    def __repr__(self):
        return str(self.to_dict())
