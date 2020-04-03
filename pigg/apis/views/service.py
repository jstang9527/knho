from utils.response import CommonResponseMixin, ReturnCode
from utils.auth import already_authorized, get_user
from django.http.response import JsonResponse
import json

popular_constellations = ['金牛座', '处女座', '天蝎座']
popular_stocks = [
    {
        'code': '000001',
        'name': '平安银行',
        'market': 'sz'
    },
    {
        'code': '600036',
        'name': '招商银行',
        'market': 'sh'
    },
    {
        'code': '601398',
        'name': '工商银行',
        'market': 'sh'
    }
]


# 星座
def constellation(request):
    if already_authorized(request):
        user = get_user(request)
        constellations = json.loads(user.focus_constellations)
    else:
        constellations = popular_constellations
    # print(constellations)
    response = CommonResponseMixin.wrap_json_response(data=constellations, code=ReturnCode.SUCCESS)
    return JsonResponse(data=response, safe=False)


def stock(request):
    if already_authorized(request):
        user = get_user(request)
        stock = json.loads(user.focus_stocks)
    else:
        stock = popular_stocks
    # print(stock)
    response = CommonResponseMixin.wrap_json_response(data=stock, code=ReturnCode.SUCCESS)
    return JsonResponse(data=response, safe=False)
