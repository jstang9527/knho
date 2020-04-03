import os
import yaml
import json
import utils.response
from pigg import settings
from apis.models import App
from django.http import JsonResponse
from django.views import View
from utils.response import CommonResponseMixin, ReturnCode
from utils.auth import already_authorized, get_user
from authorization.models import User


def init_app_data():
    data_file = os.path.join(settings.BASE_DIR, 'app.yaml')
    with open(data_file, 'r', encoding='utf-8') as f:
        apps = yaml.load(f)
        return apps


def all_menu(request):
    # global_app_data = init_app_data()
    # # publish_app_data = global_app_data['published']
    # publish_app_data = global_app_data.get('published')
    # response = utils_response.wrap_json_response(data=publish_app_data, code=utils_response.ReturnCode.SUCCESS)
    # return JsonResponse(data=response, safe=False, json_dumps_params={'ensure_ascii': False})
    query_set = App.objects.all()
    # print('query_set', query_set)
    all_app = []
    for app in query_set:
        all_app.append(app.to_dict())
    # print(all_app)
    response = utils.response.wrap_json_response(all_app)
    # print(response)
    return JsonResponse(data=response, safe=False)


class UserMenu(View, CommonResponseMixin):
    def get(self, request):
        # 如果没有登录， 返回为授权
        if not already_authorized(request):
            response = self.wrap_json_response(code=ReturnCode.UNAUTHORIZED)
            return JsonResponse(data=response, safe=False)
        open_id = request.session.get('open_id')
        user = User.objects.get(open_id=open_id)
        menu_list = user.menu.all()
        user_menu = []
        for app in menu_list:
            user_menu.append(app.to_dict())
        response = self.wrap_json_response(data=user_menu, code=ReturnCode.SUCCESS)
        return JsonResponse(data=response, safe=False)

    def post(self, request):
        if not already_authorized(request):
            response = self.wrap_json_response(code=ReturnCode.UNAUTHORIZED)
            return JsonResponse(data=response, safe=False)
        user = get_user(request)
        post_menu = json.loads(request.body.decode('utf-8'))
        post_menu = post_menu.get('data')
        focus_menu = []
        # print(post_menu)
        for item in post_menu:
            # print(item)
            # print(item.get('appid'))
            item = App.objects.get(appid=item.get('appid'))
            # print(item)
            focus_menu.append(item)
        # print(focus_menu)
        user.menu.set(focus_menu)
        user.save()
        response = CommonResponseMixin.wrap_json_response(code=ReturnCode.SUCCESS)
        return JsonResponse(response, safe=False)
