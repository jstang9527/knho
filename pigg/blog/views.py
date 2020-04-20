from django.http import JsonResponse
from .models import Category, Article
from utils.response import CommonResponseMixin


# 获取所有类目
def all_category(request):
    categorys = Category.objects.all()
    data = []
    for category in categorys:
        data.append(category.name)
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


#  获取某个类目下所有文章名
def article_category(request):
    name = request.GET.get('category')
    category = Category.objects.get(name=name)  # 不会没有，因为前端从all_category获得准确的数据
    articles = Article.objects.filter(category=category).order_by('-publish_date')  # 最新列表
    data = []
    for article in articles:
        tempDict = dict()
        tempDict['title'] = article.title
        tempDict['article_id'] = article.article_id
        data.append(tempDict)
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


# 获取文章具体内容 ?article_id=1
def get_article(request):
    article_id = request.GET.get('article_id')
    article = Article.objects.get(article_id=article_id)
    # print('article_id', article_id)
    article.pageview = article.pageview + 1  # 阅读量
    article.save()

    data = dict()
    data['content'] = []
    data['title'] = article.title
    data['author'] = article.author.nickname
    data['pageview'] = article.pageview
    brief_content = article.brief_content.split(',')
    bodys = article.content.split('###')  # 按章节分的列表

    for index, body in enumerate(bodys):
        tempDuanluo = []
        tempDict = dict()
        chapter = body.replace('\r', '')
        # chapter = body
        paragraphs = chapter.split('\n')  # 按段落再分,可能会出现空段落
        
        for paragraph in paragraphs:
            if paragraph:      # 空段落则跳过
                tempDuanluo.append(paragraph)

        tempDict['brief'] = brief_content[index]
        tempDict['body'] = tempDuanluo
        data['content'].append(tempDict)

    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)
