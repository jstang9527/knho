'''
全球IP查询区域地址
power by 易源数据API
return {'name': '德国 戴姆勒股份公司', 'en_name': 'Germany', 'ip': '53.56.64.58'}
'''
import json
import requests


def queryAddress(ip):
    top_url = 'http://saip.market.alicloudapi.com/ip'
    querys = 'ip=' + ip
    appcode = '1a2a9d56ff584bb78423d5f4090e56a8'
    headers = {'Authorization': 'APPCODE ' + appcode}
    url = top_url + '?' + querys
    try:
        resp = requests.get(url, headers=headers)
        data = json.loads(resp.text)
    except Exception as e:
        print('易源IP地址查询API出错', e)
        return {'name': 'None', 'en_name': 'None', 'ip': ip}
    data = data.get('showapi_res_body')
    ip = data.get('ip')
    country = data.get('country')  # 印度
    city = data.get('city')  # 德里
    en_name = data.get('en_name')  # India
    # continents = data.get('continents')  # 亚洲
    return {'name': country + ' ' + city, 'en_name': en_name, 'ip': ip}


if __name__ == "__main__":
    print(queryAddress('47.31.57.26'))
