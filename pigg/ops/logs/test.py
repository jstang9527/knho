import os
import re
import sys
import time
import json
sys.path.append('/opt/pigg')
import django
from pigg import settings
from utils.timeutils import standard_time
# from alter.models import Ithreat
from thirdpart import saip
from utils import address_parse


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pigg.settings')
django.setup()


def get_country(name, en_name):
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


def get_ip_address(ip):
    '''
    先使用爬虫获取, 爬取速度快;
    出错用易源免费api获取, 获取速度极慢(3~5s)
    '''
    try:
        return address_parse.queryAddress(ip)
    except Exception as e:
        print(e)
        return saip.queryAddress(ip)
        

def sshd_attack_record_toDB():
    '''
    专门分析/var/log/secure日志并推入数据库的模块;
    本模块分析极慢(每条3~5s),必须采用异步推送至数据库;
    慢的主要原因是translate翻译模块、其次为网络查询ip地址;
    '''
    data_file = os.path.join(settings.ANALYSIS_DIR, 'sshd.log')

    with open(data_file, 'r') as f:
        result = []
        lines = f.readlines()
        f.close()
        # 受害者IP
        victim_ip = lines[0].strip()
        # 受害者区域
        victim_area = get_ip_address(victim_ip)
        victim_area = get_country(victim_area.get('name'), victim_area.get('en_name'))
        cn_victim_area = victim_area.get('name')
        en_victim_area = victim_area.get('en_name')
        lines = lines[1:]
        for line in lines:
            # 攻击者ip
            attack_ip = re.findall(r'\d+\.\d+\.\d+\.\d+', line)[0]
            # 攻击者区域
            attack_area = get_ip_address(attack_ip)  # {'name': '德国 戴姆勒股份公司', 'en_name': 'Germany', 'ip': '53.56.64.58'}
            attack_area = get_country(attack_area.get('name'), attack_area.get('en_name'))
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
            tmp = {
                'attackMT': datetimeField, 'attack': attack_ip, 'attack_area': cn_attack_area, 'en_attack_area': en_attack_area,
                'victim_ip': victim_ip, 'victim_area': cn_victim_area, 'en_victim_area': en_victim_area, 'name': 'sshd'
            }
            print(tmp)
            result.append(tmp)
        return result


if __name__ == "__main__":
    # print(num_month('Nov'))
    # print(current_year())
    sshd_attack_record_toDB()
