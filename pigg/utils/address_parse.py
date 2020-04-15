'''
全球IP查询区域地址
power by 自己爬
return {'name': '德国 戴姆勒股份公司', 'en_name': 'Germany', 'ip': '53.56.64.58'}
return type: dict
'''
import re
import requests
from translate import Translator


def queryAddress(ip):
    url = 'https://www.ip138.com/iplookup.asp?ip=%s&action=2' % ip
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
    }
    resp = requests.get(url, headers=headers)
    text = resp.content.decode('gbk', errors='ignore')
    
    ip = re.findall(r'<table.*?<td align="center"><h1>.*?:(.*?)</h1>', text, re.DOTALL)[0]
    area = re.findall(r'<table.*?<ul class="ul1">.*?<font.*?>(.*?)</font>', text, re.DOTALL)[0]
    area_list = area.split('：')[1].split(' ')
    address = area_list[0]
    name = filter(lambda item: item != '', area_list)
    translator = Translator(from_lang="chinese", to_lang="english")
    en_name = translator.translate(address)
    return {'name': ' '.join(list(name)), 'en_name': en_name, 'ip': ip}


if __name__ == "__main__":
    print(type(queryAddress('53.56.64.58')))
