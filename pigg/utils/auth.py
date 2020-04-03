import json
from authorization.models import User
import requests
from pigg import settings


def c2s(appid, code):
    return code2session(appid=appid, code=code)


"""
return data格式
{
    "session_key": "xxx",
    "expires_in": "7200",
    "openid": "xxx"
}
"""


def code2session(appid, code):
    API = 'https://api.weixin.qq.com/sns/jscode2session'
    params = 'appid=%s&secret=%s&js_code=%s&grant_type=authorization_code' % \
             (appid, settings.WX_APP_SECRET, code)
    url = API + '?' + params
    response = requests.get(url=url)
    data = json.loads(response.text)
    print('data from weixin server:', data)
    return data


def already_authorized(request):
    if request.session.get('is_authorized'):
        return True
    else:
        return False


def get_user(request):
    if not already_authorized(request):
        raise Exception('not authorized request')
    open_id = request.session.get('open_id')
    user = User.objects.filter(open_id=open_id)[0]
    return user
