import re
import requests


def parse_sohu():
    '''
    搜狐新闻网
    :return type: list
    :example: ['鲍毓明取保候审', '男子儿子叫武昌', '龙卷风吹袭美国', '留学生收到祖国健康包', '抗疫医生被辱骂推搡', '嫌疑人网贷赌博']
    '''
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
    }
    url = 'http://news.sohu.com/'
    resp = requests.get(url, headers=headers)
    text = resp.text
    
    block = re.findall(r'<div class="video-mod.*?<ul>(.*?)</ul>', text, re.DOTALL)[0]
    news = re.findall(r'<i class="icon icon-video"></i>(.*?)</a></li>', block, re.DOTALL)
    return news


if __name__ == "__main__":
    parse_sohu()
