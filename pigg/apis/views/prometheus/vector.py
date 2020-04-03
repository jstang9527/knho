from django.http import JsonResponse
from thirdpart.promUtils import promVector
from utils.response import CommonResponseMixin


def get_host_uptime(request):
    hostname = request.GET.get('host')
    data = promVector.host_uptime(hostname)
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


def get_host_containers(request):
    hostname = request.GET.get('host')
    data = promVector.host_containers(hostname)
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


def get_host_cpu_guage(request):
    hostname = request.GET.get('host')
    data = promVector.host_cpu_guage(hostname)
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


def get_host_cpuload_guage(request):
    hostname = request.GET.get('host')
    data = promVector.host_cpuload_guage(hostname)
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


def get_host_mem_guage(request):
    hostname = request.GET.get('host')
    data = promVector.host_mem_guage(hostname)
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


def get_host_disk_guage(request):
    hostname = request.GET.get('host')
    data = promVector.host_disk_guage(hostname)
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)
