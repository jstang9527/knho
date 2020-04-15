from django.http import JsonResponse
from utils.response import CommonResponseMixin
from thirdpart.promUtils.promMatrix import cpuContainers, memContainers


def get_containers_cpu(request):
    hostname = request.GET.get('hostname')  # 啥都不传默认集群和10分钟的区间
    if hostname == 'All':
        hostname = ''
    interval = request.GET.get('interval')  # 只能传秒为单位的值！！！
    if interval:
        response_data = cpuContainers(hostname=hostname, time_interval=int(interval))
    else:
        response_data = cpuContainers(hostname=hostname)
    response_data = CommonResponseMixin.wrap_json_response(data=response_data)
    return JsonResponse(data=response_data, safe=False)


def get_containers_mem(request):
    hostname = request.GET.get('hostname')  # 啥都不传默认集群和10分钟的区间
    if hostname == 'All':
        hostname = ''
    interval = request.GET.get('interval')  # 只能传秒为单位的值！！！
    if interval:
        response_data = memContainers(hostname=hostname, time_interval=int(interval))
    else:
        response_data = memContainers(hostname=hostname)
    response_data = CommonResponseMixin.wrap_json_response(data=response_data)
    return JsonResponse(data=response_data, safe=False)
