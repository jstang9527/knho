###
# 作用: 实时反应当前状态
# 从最近2分钟内的数据中，获取对应的数据
# 【！！！特别注意！！！】，当query_parmas的字典出现两个key-value, 这时出现*号时，会出错
###


# 从最近2分钟内的数据中，查询内存使用率
import os
import sys
import time
import json
import django
import requests
sys.path.append('/opt/pigg')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pigg.settings')
django.setup()
from pigg.settings import PROMETHEUS_QUERY_VECTOR_URL
from utils.left_time import left_time
from urllib import parse


def publish_request(query_params):
    current_time = int(time.time())
    url = PROMETHEUS_QUERY_VECTOR_URL + query_params + '&time={}'.format(current_time)
    resp = requests.get(url=url)
    dictText = json.loads(resp.text)
    query_Status = dictText.get('status')
    if query_Status == 'success':
        result = dictText.get('data').get('result')[0]
        result = result.get('value')[1]
        return result
    return None


def host_uptime(hostname):  # 获取最新的在线时间[node_export]
    params_limit = parse.quote("{instance=~'%s:.+'}" % hostname)
    query_params = "time()-node_boot_time_seconds%s" % params_limit
    result = publish_request(query_params)
    return left_time(result)  # {'days': 4, 'hours': 13, 'minutes': 46, 'seconds': 40} value==>str(int)


def host_containers(hostname):  # 获取主机容器数[cadvisor]
    params_limit = parse.quote("{instance=~'%s:.+',name=~'.+'}" % hostname)
    query_params = "count(container_last_seen%s)" % params_limit
    result = publish_request(query_params)
    return result  # str(6)


def host_cpu_guage(hostname):
    params_limit1 = parse.quote("{instance=~'%s:.+',mode!='idle'}" % hostname)
    params_limit2 = parse.quote("{instance=~'%s:.+'}" % hostname)
    query_params = "sum(irate(node_cpu_seconds_total%s[2m]))*100 / sum(machine_cpu_cores%s)" % (params_limit1, params_limit2)
    result = publish_request(query_params)
    result = '%0.2f' % float(result)
    return '{}'.format(result)  # str(11.95%)


def host_cpuload_guage(hostname):
    params_limit = parse.quote("{instance=~'%s:.+'}" % hostname)
    # 1分钟负载
    query_params = 'node_load1%s' % params_limit
    one = publish_request(query_params)
    # 5分钟负载
    query_params = 'node_load5%s' % params_limit
    five = publish_request(query_params)
    # 15分钟负载
    query_params = 'node_load15%s' % params_limit
    fifteen = publish_request(query_params)
    return {'one': one, 'five': five, 'fifteen': fifteen}


def host_mem_guage(hostname):  # 获取最新的内存使用率[node_export]
    params_limit = parse.quote("{instance=~'%s:.+'}" % hostname)
    # 获取内存使用百分比
    query_params = '(node_memory_MemTotal_bytes%s-node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes*100' % params_limit
    value = publish_request(query_params)
    usagePercent = '%0.2f' % float(value)  # str(91.96)
    
    # 获取内存总量
    query_params = 'node_memory_MemTotal_bytes%s' % params_limit
    value = publish_request(query_params)
    memTotal = float('%0.2f' % (int(value) / (1024 * 1024 * 1024)))
    usage = float('%0.2f' % (float(usagePercent) * float(memTotal) / 100))
    return {'usage': usage, 'usagePercent': usagePercent, 'memTotal': memTotal}
    # {'usage': '0.41', 'usagePercent': '23.00', 'memTotal': '1.80'} ==>{0.41G, 23.00%, 1.8G}


def host_disk_guage(hostname):
    params_limit = parse.quote("{instance=~'%s.+',device='rootfs',mountpoint='/'}" % hostname)
    # 获取硬盘使用百分比
    query_params = "(node_filesystem_size_bytes%s - node_filesystem_avail_bytes%s) / node_filesystem_size_bytes%s *100" % (params_limit, params_limit, params_limit)
    value = publish_request(query_params)
    usagePercent = '%0.2f' % float(value)  # str(25.86%)

    # 获取硬盘总量
    query_params = 'node_filesystem_size_bytes%s' % params_limit
    value = publish_request(query_params)
    diskTotal = float('%0.2f' % (int(value) / (1024 * 1024 * 1024)))
    usage = float('%0.2f' % (float(usagePercent) * float(diskTotal) / 100))
    return {'usage': usage, 'usagePercent': usagePercent, 'diskTotal': diskTotal}


if __name__ == "__main__":
    a = host_cpuload_guage('localhost')
    print(a)
