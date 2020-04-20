'''
记录缓存10分钟
'''

from django.http import JsonResponse
from alter.models import Ithreat
from django.core.cache import cache
from utils.response import CommonResponseMixin


def test(request):

    return JsonResponse(data='ok', safe=False)


def latest_ithreat_top10(request):
    '''
    {
        attackTop10: [
            { time:"2020-04-07 06:06:36", ip:"124.173.72.114", area:"中国-北京-朝阳"},
            { time:"2020-04-06 14:16:17", ip:"124.173.72.114", area:"英国-伦敦"}
        ],
        victimTop10:[
            { time:"2020-04-07 06:06:36", ip:"124.173.72.114", area:"中国-北京-朝阳"},
            { time:"2020-04-06 14:16:17", ip:"124.173.72.114", area:"英国-伦敦"}
        ]
    }
    '''
    data = cache.get('ithreatTop10')
    # print('data', data)
    if not data:
        records = Ithreat.objects.order_by('-last_attackMT')
        attacks = []
        victims = []
        # 攻击者数组
        for record in records[:10]:
            attacks.append({'time': record.last_attackMT, 'ip': record.attack, 'area': record.cn_attack_area, 'method': record.name})
        
        # 受害者数组
        sign = []  # 临时存储受害者ip，为保证所有受害者不重复
        for record in records:
            if len(victims) >= 10:
                break
            if record.victim not in sign:
                sign.append(record.victim)
                victims.append({'time': record.last_attackMT, 'ip': record.victim, 'area': record.cn_victim_area, 'method': record.name})
        data = {'attacks': attacks, 'victims': victims}
        cache.set('ithreatTop10', data, 60 * 10)  # 10minutes
        print('设置ithreatTop10缓存到cache')
    
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


# 数据统计
def statistics(request):
    '''
    {
        "times":135,
        "attack_maxtimes":86,
        "suffer_maxtimes":123,
        "attack_data":[{"name":"UK", "value":13},{"name":"US", "value":19}],
        "suffer_data":[{"name":"China", "value"13},{"name":"Russia", "value":19}]
        "attackChartData": { //攻击源
            "data": [15, 20, 45, 37, 77, 63, 22, 58, 46, 79],
            "categories": ['124.172.152.128', '47.92.255.39', '192.168.47.127', '172.32.55.178','124.172.152.128',
                         '47.92.255.39','192.168.47.127', '172.32.55.178','124.172.152.128', '47.92.255.39']
        },
        "victimChartData":{  //受害者
            "data": [15, 20, 45],
            "categories": ['124.172.152.128', '47.92.255.39','124.172.152.128']
        },
        "methodChartData":[  //攻击方法统计
            { "name": "sshd", "data": 15, },
            { "name": "syn flood", "data": 35, },
            { "name": "http", "data": 78, }
        ]
    }
    '''
    # 从内存取
    response_data = cache.get('ithreatStatistics')
    if response_data:
        response_data = CommonResponseMixin.wrap_json_response(data=response_data)
        return JsonResponse(data=response_data, safe=False)

    all_times = 0  # 攻击/受灾次数
    all_records = Ithreat.objects.all()
    attack_maxtimes = 0  # 攻击次数最大值，visual_bar的值，控制板块颜色
    suffer_maxtimes = 0  # 受灾次数最大值，visual_bar的值，控制板块颜色

    # 将记录按地区分组
    attack = dict()
    suffer = dict()
    # 将记录按IP分组
    attackGroup_ip = dict()
    sufferGroup_ip = dict()
    # 统计方式分组
    methodGroup = dict()
    for record in all_records:
        if record.en_attack_area not in attack:  # 攻击方新区域
            attack[record.en_attack_area] = 0
        if record.en_victim_area not in suffer:  # 受害者新区域
            suffer[record.en_victim_area] = 0
        if record.attack not in attackGroup_ip:  # 攻击方新IP
            attackGroup_ip[record.attack] = 0
        if record.victim not in sufferGroup_ip:  # 受害者新IP
            sufferGroup_ip[record.victim] = 0
        if record.name not in methodGroup:  # 新攻击方式
            methodGroup[record.name] = 0

        # 取该记录的攻击/受灾次数
        times = record.times

        # 取之前攻击累加的记录
        attack[record.en_attack_area] += times
        suffer[record.en_victim_area] += times
        attackGroup_ip[record.attack] += times
        sufferGroup_ip[record.victim] += times
        methodGroup[record.name] += times

        # 攻击总数
        all_times += times

        # 计算区域攻击/受灾最大次数
        if attack_maxtimes < attack[record.en_attack_area]:
            attack_maxtimes = attack[record.en_attack_area]
        if suffer_maxtimes < suffer[record.en_victim_area]:
            suffer_maxtimes = suffer[record.en_victim_area]

    # 重整格式
    attack_data = []
    suffer_data = []
    attackChartData = {'data': [], 'categories': []}
    victimChartData = {'data': [], 'categories': []}
    methodChartData = []

    # 柱形图排序取前10
    attackGroup_ip = sorted(attackGroup_ip.items(), key=lambda asd: asd[1], reverse=True)[:10]
    sufferGroup_ip = sorted(sufferGroup_ip.items(), key=lambda asd: asd[1], reverse=True)[:10]
    attackGroup_ip = dict(attackGroup_ip)
    sufferGroup_ip = dict(sufferGroup_ip)

    for k, v in attack.items():
        attack_data.append({'name': k, 'value': v})
    for k, v in suffer.items():
        suffer_data.append({'name': k, 'value': v})
    for k, v in attackGroup_ip.items():
        attackChartData['categories'].append(k)
        attackChartData['data'].append(v)
    for k, v in sufferGroup_ip.items():
        victimChartData['categories'].append(k)
        victimChartData['data'].append(v)
    for k, v in methodGroup.items():
        methodChartData.append({'name': k, 'data': v})

    response_data = {
        'times': all_times, 'attack_maxtimes': attack_maxtimes, 'suffer_maxtimes': suffer_maxtimes,
        'attack_data': attack_data, 'suffer_data': suffer_data, 'attackChartData': attackChartData,
        'victimChartData': victimChartData, 'methodChartData': methodChartData
    }
    cache.set('ithreatStatistics', response_data, 60 * 5)
    print('将ithreat统计数据进行缓存')
    response_data = CommonResponseMixin.wrap_json_response(data=response_data)

    return JsonResponse(data=response_data, safe=False)
