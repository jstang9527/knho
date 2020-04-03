import os
import django
from celery import Celery
from thirdpart.clamd_scan import clamavScan, reloadDB
from pigg import settings
from django.core.cache import cache


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pigg.settings')
django.setup()

app = Celery('celery_tasks.public_tasks', broker='redis://localhost', backend='redis://localhost')


@app.task
def clamavfile(scantype, filepath):
    ip_list = []
    ip_list.append(settings.LOCAL_IP)

    # 获取已加载DB的ip列表
    clamdDBS = cache.get('clamdDBS')
    if not clamdDBS:  # 如果为空，则将变量变为空数组
        clamdDBS = []
    set1 = set(ip_list)
    set2 = set(clamdDBS)
    ips = set1 - set2  # cache中没有的值
    for ip in list(ips):
        data = reloadDB(agent_ip=ip)
        if data['status'] == 'success':
            clamdDBS.append(ip)
            # cache.set('clamdVersion', data['version'], 60 * 60 * 24)
            cache.set('clamdDBS', clamdDBS, 60 * 60 * 24)

    # scan uploadfile in localhost
    result = clamavScan(ip_list=ip_list, scan_type=scantype, filepath=filepath)
    os.remove(filepath)
    return result


@app.task
def multi_clamd(ip_list, scantype, filedir):
    # 获取已加载DB的ip列表
    clamdDBS = cache.get('clamdDBS')
    if not clamdDBS:  # 如果为空，则将变量变为空数组
        clamdDBS = []
    set1 = set(ip_list)
    set2 = set(clamdDBS)
    ips = set1 - set2  # cache中没有的值
    for ip in list(ips):
        data = reloadDB(agent_ip=ip)
        if data['status'] == 'success':
            clamdDBS.append(ip)
            cache.set('clamdDBS', clamdDBS, 60 * 60 * 24)

    result = clamavScan(ip_list=ip_list, scan_type=scantype, filepath=filedir)
    return result
