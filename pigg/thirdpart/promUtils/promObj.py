import time
import json
import requests


# 获取主机列表
def get_nodeExport(topUrl):
    current_time = int(time.time())
    hosts = []
    query_params = 'up{job="node-export"}'
    url = topUrl + query_params + '&time='.format(current_time)
    resp = requests.get(url)
    dictText = json.loads(resp.text)
    if dictText.get('status') == 'success':
        metrics = dictText.get('data').get('result')
        for metric in metrics:
            both = dict()
            both['hostname'] = metric.get('metric').get('instance').split(':')[0]
            both['isOnLine'] = metric.get('value')[1]
            hosts.append(both)
    return hosts  # [{'hostname': '47.92.255.39', 'isOnLine': '1'}, {'hostname': 'localhost', 'isOnLine': '1'}]


# 获取host下容器列表
def get_containers(hostname):
    pass


if __name__ == "__main__":
    topUrl = 'http://localhost:9090/api/v1/query?query='
    # 一期工程中，前端要求根据特定主机名查询它自己的数据
    a = get_nodeExport(topUrl)
    print(a)
