###
# 作用: 获取指定时间区间的数据组
#
###


import os
import sys
import time
import json
import django
import requests
sys.path.append('/opt/pigg')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pigg.settings')
django.setup()
from pigg.settings import PROMETHEUS_QUERY_MATRIX_URL
from urllib import parse


def public_request(time_interval, query_params, num):
    end = int(time.time())
    step = int(time_interval / num)  # 单位秒, 求单位时间的平均变化率 前端定死10个X轴点
    start = end - time_interval + step
    
    url = PROMETHEUS_QUERY_MATRIX_URL + query_params + '&start=%s&end=%s&step=%ss' % (start, end, step)
    resp = requests.get(url)
    dictText = json.loads(resp.text)

    if dictText.get('status') != 'success':
        return None
    # print(dictText)
    # 获取y轴值
    containers = []
    yAxis_data = time_range(current_time=end, time_interval=time_interval, step=step)
    # 获取series值
    results = dictText.get('data').get('result')
    for result in results:
        both = dict()
        both['name'] = result.get('metric').get('name')
        values = result.get('values')
        data = []
        exist_time = []
        for value in values:
            data.append(float('%0.2f' % float(value[1])))   # 时间点的值
            exist_time.append(value[0])    # 时间点
        if len(data) != num:
            both['data'] = fillData(num, exist_time, data, start, step)
        else:
            both['data'] = data
        # both['data'] = data
        containers.append(both)
    
    if not containers:  # 没有容器时或者宿主机宕机时
        containers = [{'name': '', 'data': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}]
    return {'yAxis_data': yAxis_data, 'con_value': containers}


# 数据中断，补位
def fillData(num, exist_time, data, start, step):  # exist_time是有数据的时间点，data就是该时间点的值
    result_data = []
    j = 0
    for i in range(num):
        if len(exist_time) > j:
            # print(exist_time[j], '=', start)
            if exist_time[j] == start:
                result_data.append(data[j])
                j = j + 1
            else:
                result_data.append(None)
        else:
            result_data.append(None)
        start = start + step
    return result_data


# 根据时间范围和区间，返回Y轴列表值
def time_range(current_time, time_interval, step):
    yAxis_data = []
    for i in range(10):
        timeArray = time.localtime(current_time)
        if time_interval > 60 * 60 * 24:
            otherStyleTime = time.strftime("%d %H:%M", timeArray)  # 17:36  "%Y--%m--%d %H:%M:%S"
        else:
            otherStyleTime = time.strftime("%H:%M", timeArray)
        yAxis_data.append(otherStyleTime)
        current_time = current_time - step
    yAxis_data.reverse()
    return yAxis_data


# PromSQL: sum(rate(container_cpu_usage_seconds_total{name=~'.+',instance=~'localhost.+'}[1m])) by (name) * 100
def cpuContainers(hostname='', time_interval=60 * 10):  # 默认10分钟, 只能传单位为秒的值
    # 10分钟、30分钟、1小时、3小时、6小时、12小时、24小时、3天、7天、10天
    step = int(time_interval / 10)  # 单位秒, 求单位时间的平均变化率 前端定死10个X轴点
    params_limit = parse.quote("{name=~'.+',instance=~'%s.+'}" % hostname)
    query_params = "sum(rate(container_cpu_usage_seconds_total%s[%ss])) by (name) * 100" % (params_limit, step)
    return public_request(time_interval, query_params, 10)  # 同上: 单位秒, 求单位时间的平均变化率 前端定死10个X轴点
        

# PromSQL: sum(container_memory_rss{name=~'.+',instance=~'.+'})by(name)/(1024*1024)
def memContainers(hostname='', time_interval=60 * 10):  # 默认10分钟, 只能传单位为秒的值
    # 10分钟、30分钟、1小时、3小时、6小时、12小时、24小时、3天、7天、10天
    # step = int(time_interval / 10)  # 为啥不要？因为不是计算增长速率，而上面CPU是计算增长速率的
    params_limit = parse.quote("{name=~'.+',instance=~'%s.+'}" % hostname)
    query_params = "sum(container_memory_rss%s)by(name)/(1024*1024)" % params_limit
    return public_request(time_interval, query_params, 10)


if __name__ == "__main__":
    a = memContainers(hostname='47.92.255.39', time_interval=60 * 10)
    a = json.dumps(a)
    print(a)
