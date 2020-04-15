import os
import re
import sys
import time
import json
import django
sys.path.append('/opt/pigg')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pigg.settings')
django.setup()
from utils import address_parse
from thirdpart import saip
from alter.models import Ithreat
from utils.timeutils import standard_time
from pigg import settings


def __get_country(name, en_name):
    '''
    根据城市判断是否属于中国
    :return:
    '''
    file_path = os.path.join(settings.RESOURCES_DIR, 'data', 'chinaMap.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        cities = json.loads(f.read())
        cities = cities.get('province')
        if ''.join(list(name)[:2]) in cities:
            return {'name': name, 'en_name': 'China'}
        else:
            return {'name': name, 'en_name': en_name}


def __get_ip_address(ip):
    '''
    先使用爬虫获取, 爬取速度快;
    出错用易源免费api获取, 获取速度极慢(3~5s)
    '''
    try:
        return address_parse.queryAddress(ip)
    except Exception as e:
        print('爬虫爬取出错:->启用备用易源IP地址查询', e)
        return saip.queryAddress(ip)


def sshd_attack_record_toDB():
    '''
    专门分析/var/log/secure日志并推入数据库的模块;
    本模块分析极慢(每条3~5s),必须采用异步推送至数据库;
    慢的主要原因是translate翻译模块、其次为网络查询ip地址;
    '''
    data_file = os.path.join(settings.ANALYSIS_DIR, 'sshd.log')
    if(os.path.exists(data_file)):
        with open(data_file, 'r') as f:
            # result = []
            lines = f.readlines()
            f.close()
            os.remove(data_file)
    else:
        print('文件不存在[%s]' % data_file)
        return
    # 受害者IP
    victim_ip = lines[0].strip()
    # 受害者区域
    victim_area = __get_ip_address(victim_ip)
    victim_area = __get_country(victim_area.get(
        'name'), victim_area.get('en_name'))
    cn_victim_area = victim_area.get('name')
    en_victim_area = victim_area.get('en_name')
    lines = lines[1:]
    for line in lines:
        # 攻击者ip
        attack_ip = re.findall(r'\d+\.\d+\.\d+\.\d+', line)[0]
        # 攻击者区域
        # {'name': '德国 戴姆勒股份公司', 'en_name': 'Germany', 'ip': '53.56.64.58'}
        attack_area = __get_ip_address(attack_ip)
        attack_area = __get_country(attack_area.get(
            'name'), attack_area.get('en_name'))
        cn_attack_area = attack_area.get('name')
        en_attack_area = attack_area.get('en_name')
        # 攻击方式
        line_list = line.split(' ')
        line_list = filter(lambda item: item != '', line_list)
        line_list = list(line_list)

        # 日期字段
        year = time.localtime(time.time()).tm_year
        month = line_list[0]
        day = line_list[1]
        sfm = line_list[2]
        datetimeField = standard_time(year, month, day, sfm)
        tmpDict = {
            'attackMT': datetimeField, 'attack': attack_ip, 'attack_area': cn_attack_area, 'en_attack_area': en_attack_area,
            'victim_ip': victim_ip, 'victim_area': cn_victim_area, 'en_victim_area': en_victim_area, 'name': 'sshd'
        }
        # __push_to_DB(tmpDict)
        print(tmpDict)
        print('===' * 40)


def __push_to_DB(data):
    dbRecord = Ithreat.objects.filter(attack=data.get('attack'), victim=data.get('victim_ip'))
    # 先判断数据库中是否有这条记录，有则times++并更新最后攻击记录
    if dbRecord.exists():
        dbRecord = dbRecord[0]
        dbRecord.last_attackMT = data.get('attackMT')
        print(dbRecord.times)
        dbRecord.times = dbRecord.times + 1
        dbRecord.save()
    else:
        newIthreat = Ithreat(name=data.get('name'), times=1, attack=data.get('attack'), victim=data.get('victim_ip'),
                             cn_attack_area=data.get('attack_area'), en_attack_area=data.get('en_attack_area'), last_attackMT=data.get('attackMT'),
                             cn_victim_area=data.get('victim_area'), en_victim_area=data.get('en_victim_area'), attackMT=data.get('attackMT')
                             )
        newIthreat.save()


if __name__ == "__main__":
    sshd_attack_record_toDB()
    pass
