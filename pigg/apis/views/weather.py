from django.http import JsonResponse
from utils.weather_parse import WeatherParse
from utils.response import CommonResponseMixin
from django.views import View
from utils.auth import already_authorized
from utils.response import ReturnCode
from authorization.models import User
import json
import re
from django.core.cache import cache
import logging

logger = logging.getLogger('django')


def helloworld(request):
    # print('request.method', request.method)
    # print('request.meta', request.META)
    # print('request.cookie', request.COOKIES)
    # print('request QueryDict', request.GET)
    data = dict()
    data['query'] = request.GET.get('info')
    # http://127.0.0.1:8000/api/v1.0/service/hello?info=beijing
    return JsonResponse(data=data, safe=False, status=200)  # {"query": "beijing"}


class WeatherView(View, CommonResponseMixin, WeatherParse):
    # 获得个人页面的天气信息
    def get(self, request):
        if not already_authorized(request):
            response = self.wrap_json_response({}, code=ReturnCode.UNAUTHORIZED)
        else:
            data = []
            open_id = request.session.get('open_id')
            user = User.objects.filter(open_id=open_id)[0]
            cities = json.loads(user.focus_cities)
            for city in cities:
                city = re.sub(r'市', '', city['city'])
                value = cache.get(city)
                if value:
                    result = value
                    logger.info('personal get weather for %s in cache' % city)
                else:
                    result = self.get_weather_now(city)
                    cache.set(city, result, 60 * 30)
                    logger.info('personal set weather for %s in cache' % city)
                result['city_info'] = city
                data.append(result)
            response = self.wrap_json_response(data=data, code=ReturnCode.SUCCESS)
        return JsonResponse(data=response, safe=False)

    # 公共城市天气、查询信息
    def post(self, request):
        data = []
        received_body = json.loads(request.body)
        received_body = received_body.get('cities')
        cities = received_body.get('cities')
        for city in cities:
            if r'市' in city:
                city = re.sub(r'市', '', city)
            value = cache.get(city)
            if value:
                result = value
                logger.info('public get cache for weather in %s' % city)
            else:
                result = self.get_weather_now(city)
                cache.set(city, result, 60 * 30)
                logger.info('public set cache for weather in %s' % city)
            data.append(result)

        data = self.wrap_json_response(data=data)
        return JsonResponse(data=data, safe=False, json_dumps_params={'ensure_ascii': False})
        # return JsonResponse(data=response_data, safe=False, status=200, json_dumps_params={'ensure_ascii': False})
        # safe为false的意思是，如果data不是json对象也能转换，否作只能转换json对象

    # < Response[200] >
    # {"data": [{"temperature_time": "22:00", "area": "深圳", "quality": "优质", "weather": "阴", "temperature": "27"},
    #           {"temperature_time": "22:00", "area": "广州", "quality": "良好", "weather": "阴", "temperature": "25"}],
    #  "result_code": 0, "message": "success"}
