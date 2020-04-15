# #
# 获取当前主机列表
# 获取当前容器列表
##

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
from urllib import parse


def nodeExport_list():
    current_time = int(time.time())
    hosts = []
    params_limit = parse.quote('{job="node-export"}')
    query_params = 'up%s' % params_limit
    url = PROMETHEUS_QUERY_VECTOR_URL + query_params + '&time='.format(current_time)
    resp = requests.get(url)
    dictText = json.loads(resp.text)
    result = dictText.get('data').get('result')
    for item in result:
        instance = item.get('metric').get('instance').split(':')[0]
        value = item.get('value')[1]
        data = {'instance': instance, 'isOnLine': value}
        hosts.append(data)
    hosts.append({'instance': 'All', 'isOnLine': '1'})
    return hosts  # [{'instance': '47.92.255.39', 'isOnLine': '1'}, {'instance': 'localhost', 'isOnLine': '1'}]


# hostname为空时, 获取集群所有容器; 反之获取该主机下的所有容器, 服务依赖cadvisor
def container_list(hostname=''):
    current_time = int(time.time())
    containers = []
    params_limit = parse.quote("{name=~'.+',instance=~'%s.+'}" % hostname)
    query_params = "container_last_seen%s" % params_limit
    url = PROMETHEUS_QUERY_VECTOR_URL + query_params + '&time='.format(current_time)
    resp = requests.get(url)
    dictText = json.loads(resp.text)
    result = dictText.get('data').get('result')
    for item in result:
        container = item.get('metric').get('name')
        instance = item.get('metric').get('instance').split(':')[0]
        value = item.get('value')[1]
        isOnLine = int(value) > current_time - 5 * 60                           # 心跳超过5分钟无反应则判定down
        data = {'instance': instance, 'container': container, 'isOnLine': isOnLine}
        containers.append(data)
    return containers
    # [{'instance': 'localhost', 'container': 'grafana', 'isOnLine': 'True'},
    # {'instance': '47.92.255.39', 'container': 'node-exporter', 'isOnLine': 'False'}]


if __name__ == "__main__":
    a = nodeExport_list()
    print(a)
