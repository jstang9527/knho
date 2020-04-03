# -*- encoding=utf-8 -*-

from django.http import JsonResponse
from utils.response import wrap_json_response, ReturnCode, CommonResponseMixin
from django.views import View
import json
from utils.auth import c2s, already_authorized
from .models import User


# 首此请求设置客户端cookie
def test_session(request):
    request.session['message'] = 'Test Django Session OK'
    response = wrap_json_response(code=ReturnCode.SUCCESS)
    return JsonResponse(data=response, safe=False)


# 二次请求查看客户端携带的cookie
def test_session2(request):
    print(request.session.items())
    response = wrap_json_response(code=ReturnCode.SUCCESS)
    return JsonResponse(data=response, safe=False)


def get_status(request):
    print("call get_status function...")
    if already_authorized(request):
        data = {"is_authorized": 1}
    else:
        data = {"is_authorized": 0}
    response = CommonResponseMixin.wrap_json_response(data=data, code=ReturnCode.SUCCESS)
    return JsonResponse(data=response, safe=False)


def logout(request):
    request.session.clear()
    response = wrap_json_response(code=ReturnCode.SUCCESS, message='logout')
    return JsonResponse(data=response, safe=False)


class UserView(View, CommonResponseMixin):
    def get(self, request):
        # 没有认证
        if not already_authorized(request):
            response = self.wrap_json_response(code=ReturnCode.UNAUTHORIZED)
            return JsonResponse(data=response, safe=False)
        # 认证通过
        open_id = request.session.get('open_id')
        user = User.objects.get(open_id=open_id)
        data = dict()
        data['focus'] = dict()
        data['focus']['city'] = json.loads(user.focus_cities)
        data['focus']['stock'] = json.loads(user.focus_stocks)
        data['focus']['constellation'] = json.loads(user.focus_constellations)
        response = self.wrap_json_response(data=data, code=ReturnCode.SUCCESS)
        return JsonResponse(data=response, safe=False)

    def post(self, request):
        # 没有认证
        if not already_authorized(request):
            response = self.wrap_json_response(code=ReturnCode.UNAUTHORIZED)
            return JsonResponse(data=response, safe=False)
        # 认证通过
        open_id = request.session.get('open_id')
        user = User.objects.get(open_id=open_id)

        received_body = request.body.decode('utf-8')
        # 将str转为字典dict
        received_body = eval(received_body)
        print('---\nUSER【%s】[%s] post data:%s' % (user.nickname, open_id, received_body))
        cities = received_body.get('city')
        stocks = received_body.get('stock')
        constellations = received_body.get('constellation')

        user.focus_cities = json.dumps(cities)
        user.focus_stocks = json.dumps(stocks)
        user.focus_constellations = json.dumps(constellations)
        user.save()

        response = wrap_json_response(code=ReturnCode.SUCCESS, message='modify user info success.')
        return JsonResponse(data=response, safe=False)


def __authorize_by_code(request):
    """
    使用wx.login到的临时code到微信提供的code2session接口授权

    post_data = {
        'encryptedData': 'xxx',
        'appId': 'xxx',
        'sessionKey': 'xxx',
        'iv': 'xxx'
    }
    """
    post_data = request.body.decode('utf-8')
    print('data from applet:', post_data)
    post_data = json.loads(post_data)
    code = post_data.get('code').strip()
    app_id = post_data.get('appId').strip()
    nickname = post_data.get('nickname').strip()
    response = {}
    # 需要微信小程序提供code和appid，然后将code、appid和secret提交给c2s向微信接口服务认证
    if not code or not app_id:
        response['message'] = 'lost code or appId'
        response['code'] = ReturnCode.BROKEN_AUTHORIZED_DATA
        return JsonResponse(data=response, safe=False)
    data = c2s(app_id, code)
    openid = data.get('openid')
    print('get openid from c2s:', openid)
    # 若没有从微信接口服务获取到openid，则认证失败
    if not openid:
        response = wrap_json_response(code=ReturnCode.UNAUTHORIZED, message='auth failed')
        return JsonResponse(data=response, safe=False)

    request.session['open_id'] = openid
    request.session['is_authorized'] = True

    # 认证成功后查看该用户是否在开发者数据存在，不存在则保存
    if not User.objects.filter(open_id=openid):
        new_user = User(open_id=openid, nickname=nickname)
        new_user.save()

    response = wrap_json_response(code=ReturnCode.SUCCESS, message='auth success.')
    return JsonResponse(data=response, safe=False)


def authorize(request):
    return __authorize_by_code(request)
