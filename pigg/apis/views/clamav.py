import hashlib
import os
import json
from django.http import JsonResponse
from celery import current_app
from utils.response import CommonResponseMixin, ReturnCode
from django.views import View
from pigg import settings
from celery_tasks.pub_tasks.tasks import clamavfile, multi_clamd
from django.core.cache import cache
from thirdpart import clamd_scan


def getVersion(request):
    data = clamd_scan.version(settings.LOCAL_IP)
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


def get_taskId_list(request):
    queryType = request.GET.get('type')
    if queryType == 'clamavfileid' or queryType == 'multiclamdid':
        value = cache.get(queryType)
        if not value:
            value = 'None'  # 没值要附值，不然前端没有二层data字段
        response_data = CommonResponseMixin.wrap_json_response(data=value)
        return JsonResponse(data=response_data, safe=False)
    response_data = CommonResponseMixin.wrap_json_response(code=ReturnCode.WRONG_PARAMS)
    return JsonResponse(data=response_data, safe=False)


class FileView(View, CommonResponseMixin):
    # receive singlefile
    def post(self, request):
        scantype = 'multiscan_file'
        if request.GET.get('scantype'):
            scantype = request.GET.get('scantype')

        files = request.FILES
        for key, value in files.items():
            content = value.read()
            md5 = hashlib.md5(content).hexdigest()
            path = os.path.join(settings.FILES_DIR, md5)
            with open(path, 'wb') as f:
                f.write(content)
            task = clamavfile.delay(scantype=scantype, filepath=path)
        
        # 文件类扫描任务id列表[内存]
        value = cache.get('clamavfileid')
        if not value:
            value = []
        value.append(task.id)
        cache.set('clamavfileid', value, 60 * 60 * 72)  # 3 days

        response_data = {'task_id': task.id, 'status': task.status}
        response_data = self.wrap_json_response(data=response_data)
        return JsonResponse(data=response_data, safe=False)


class MultiClamdView(View, CommonResponseMixin):
    def post(self, request):
        received_body = request.body
        try:
            received_body = json.loads(received_body)
            obj = received_body.get('object')
            ip_list = obj.get('ip_list')
            filedir = obj.get('filedir')
            scantype = obj.get('scantype')
            task = multi_clamd.delay(ip_list=ip_list, scantype=scantype, filedir=filedir)

            # 客户端扫描任务列表[内存]
            value = cache.get('multiclamdid')
            if not value:
                # 内存为空时
                value = []
            value.append(task.id)
            cache.set('multiclamdid', value, 60 * 60 * 72)  # 存储在内存 3 days

        except (json.decoder.JSONDecodeError, ValueError, Exception) as e:
            response = self.wrap_json_response(message=str(e), code=ReturnCode.WRONG_PARAMS)
            return JsonResponse(data=response, safe=False, json_dumps_params={'ensure_ascii': False})
        response_data = {'task_id': task.id, 'status': task.status}
        response_data = self.wrap_json_response(data=response_data)
        return JsonResponse(data=response_data, safe=False)


class TaskView(View, CommonResponseMixin):
    def get(self, request, task_id):
        task = current_app.AsyncResult(task_id)
        response_data = {'task_id': task_id, 'status': task.status, 'result': ''}
        
        if task.status == 'SUCCESS':
            response_data['result'] = task.get()
        response_data = self.wrap_json_response(data=response_data)
        return JsonResponse(data=response_data, safe=False)
