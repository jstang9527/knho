from utils.response import CommonResponseMixin, ReturnCode
from django.http.response import JsonResponse
from utils.auth import already_authorized, get_user
from utils.news_parse import parse_sohu
from django.core.cache import cache
import json


# 新闻
def news(request):
    data = cache.get('news')
    if not data:
        data = parse_sohu()
        cache.set('news', data, 60 * 60)  # 1h
    
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


# 服务告警
def service_alter(request):
    data = [
        {'content': 'clamav容器服务的MEM已超过告警阈值20%, 具体值为847M', 'host': '47.92.255.39', 'time': '2020-04-16T18:03:00'},
        {'content': '主机zan71.com的Disk已超过告警阈值80%, 具体值为39.65G', 'host': 'zan71.com', 'time': '2020-04-14T20:44:37'},
        {'content': '主机localhost的CPU已超过告警阈值80%, 具体值为82.62%', 'host': 'localhost', 'time': '2020-04-14T13:18:25'},
    ]
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


# 已遗弃
def constellation(request):
    if already_authorized(request):
        user = get_user(request)
        constellations = json.loads(user.focus_constellations)
    else:
        constellations = ['', '', '']
    # print(constellations)
    response = CommonResponseMixin.wrap_json_response(data=constellations, code=ReturnCode.SUCCESS)
    return JsonResponse(data=response, safe=False)


# 已遗弃
def stock(request):
    if already_authorized(request):
        user = get_user(request)
        stock = json.loads(user.focus_stocks)
    else:
        stock = ['', '']
    # print(stock)
    response = CommonResponseMixin.wrap_json_response(data=stock, code=ReturnCode.SUCCESS)
    return JsonResponse(data=response, safe=False)
