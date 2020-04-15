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
    print('data', data)
    if not data:
        records = Ithreat.objects.order_by('-last_attackMT')
        attacks = []
        victims = []
        # 攻击者数组
        for record in records[:10]:
            attacks.append({'time': record.last_attackMT, 'ip': record.attack, 'area': record.cn_attack_area})
        
        # 受害者数组
        sign = []  # 临时存储受害者ip，为保证所有受害者不重复
        for record in records:
            if len(victims) >= 10:
                break
            if record.victim not in sign:
                print(sign)
                print(record.victim)
                sign.append(record.victim)
                victims.append({'time': record.last_attackMT, 'ip': record.victim, 'area': record.cn_victim_area})
        data = {'attacks': attacks, 'victims': victims}
        cache.set('ithreatTop10', data, 60 * 10)  # 10minutes
        print('设置缓存到cache')
    
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False)


# 数据统计
def statistics(request):
    '''
    attack_data: [{ name: 'US', value: 169 },{ name: 'Russia', value: 129 },{ name: 'China', value: 99 }]
    'attack': { 'Russia': 169, 'China': 46, 'US': 246 }
    'suffer': { 'Russia': 177, 'China': 168, 'Japan': 44 }
    '''
    all_times = 0  # 攻击/受灾次数
    all_records = Ithreat.objects.all()
    attack_maxtimes = 0  # 攻击次数最大值，visual_bar的值，控制板块颜色
    suffer_maxtimes = 0  # 受灾次数最大值，visual_bar的值，控制板块颜色

    # 将记录按地区分组
    attack = dict()
    suffer = dict()
    for record in all_records:
        if record.en_attack_area not in attack:  # 新区域
            attack[record.en_attack_area] = 0
        if record.en_victim_area not in suffer:  # 新区域
            suffer[record.en_victim_area] = 0
        # 取该记录的攻击/受灾次数
        times = record.times

        # 取之前攻击累加的记录
        attack[record.en_attack_area] += times
        suffer[record.en_victim_area] += times
        all_times += times

        if attack_maxtimes < attack[record.en_attack_area]:
            attack_maxtimes = attack[record.en_attack_area]
        if suffer_maxtimes < suffer[record.en_victim_area]:
            suffer_maxtimes = suffer[record.en_victim_area]

    # 重整格式
    attack_data = []
    suffer_data = []
    for k, v in attack.items():
        attack_data.append({'name': k, 'value': v})
    for k, v in suffer.items():
        suffer_data.append({'name': k, 'value': v})

    response_data = {
        'times': all_times, 'attack_maxtimes': attack_maxtimes, 'suffer_maxtimes': suffer_maxtimes,
        'attack_data': attack_data, 'suffer_data': suffer_data
    }
    response_data = CommonResponseMixin.wrap_json_response(data=response_data)

    return JsonResponse(data=response_data, safe=False)
