import re
import requests
from urllib import request
from xpinyin import Pinyin
import time
from lxml import etree


class WeatherParse(object):

    Headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    }
    Url = 'https://www.tianqi.com/'
    pinyin = Pinyin()

    def parse_weather_now(self, url, headers):
        weather_now = dict()
        resp = requests.get(url, headers=headers)
        text = resp.text
        city = re.findall(r'<dd class="name"><h2>(.*?)</h2>', text, re.DOTALL)[0]
        weather = re.findall(r'<span><b>(.*?)</b>', text, re.DOTALL)[0]
        temperature = re.findall(r'<p class="now"><b>(.*?)</b>', text, re.DOTALL)[0]
        now_time = re.findall(r'<dd class="week">(.*?)</dd>', text, re.DOTALL)[0]
        date = re.findall(r'(.*?)日', now_time)[0] + '日'
        week = '星期' + re.findall(r'星期(.*?)\s', now_time)[0]
        img_url = 'http://' + re.findall(r'<dd class="weather">\n<i><img src="//(.*?)">', text, re.DOTALL)[0]
        items = re.findall(r'<dd class="shidu"><b>(.*?)</b><b>(.*?)</b><b>(.*?)</b>', text, re.DOTALL)[0]
        nodes = []
        for item in list(items):
            temp = re.split(r'：', item)[1]
            nodes.append(temp)
        humidity = nodes[0]
        wind_direct = nodes[1]
        ultraviolet_rays = nodes[2]
        quality = re.findall(r'<dd class="kongqi">.*?：(.*?)</h5>', text, re.DOTALL)[0]
        PM = re.findall(r'<dd class="kongqi">.*?</h5><h6>PM:(.*?)</h6>', text, re.DOTALL)[0].strip()
        # print('城市：%s\t气温：%s℃\t%s\t 日期：%s\t 湿度：%s\t风西：%s\t紫外线：%s\t天气：%s\t天气质量：%s\tPM：%s'
        #       % (city, temperature, week, date, humidity, wind_direct, ultraviolet_rays, weather, quality, PM))
        # print('imgUrl：%s' % img_url)
        datetime = time.strftime('%H:%M:%S', time.localtime(time.time()))
        weather_now['city'] = city
        weather_now['week'] = week
        weather_now['date'] = date
        weather_now['datetime'] = datetime
        weather_now['quality'] = quality
        weather_now['temperature'] = temperature
        weather_now['weather'] = weather
        weather_now['wind_direct'] = wind_direct
        weather_now['humidity'] = humidity
        weather_now['ultraviolet_rays'] = ultraviolet_rays
        weather_now['PM'] = PM
        weather_now['img_url'] = img_url
        weather_now['img_src'] = self.pinyin.get_pinyin(weather, '')
        return weather_now

    def parse_weather_7(self, url, headers, city):
        resp = requests.get(url, headers=headers)
        # text = resp.content.decode('utf-8')
        text = resp.text
        html = etree.HTML(text)

        datetimes = []
        weeks = []
        img_urls = []
        date_weeks = html.xpath("//ul[@class='week']/li")
        for item in date_weeks:
            datetimes.append(item.xpath("./b/text()")[0])
            weeks.append(item.xpath("./span/text()")[0])
            img_urls.append('http:' + item.xpath("./img/@src")[0])
        weathers = html.xpath("//ul[@class='txt txt2']/li/text()")
        temperatures = html.xpath("//div[@class='zxt_shuju']/ul")[0]
        max_temperatures = temperatures.xpath("./li/span/text()")
        min_temperatures = temperatures.xpath("./li/b/text()")

        results = []
        for i in range(len(weathers)):
            result = dict()
            result['datetime'] = datetimes[i]
            result['week'] = weeks[i]
            result['weather'] = weathers[i]
            result['max_temperature'] = max_temperatures[i]
            result['min_temperature'] = min_temperatures[i]
            result['img_url'] = img_urls[i]
            result['img_src'] = self.pinyin.get_pinyin(weathers[i], '')
            results.append(result)
        all = dict()
        all[city] = results
        return all

    def get_weather_now(self, city):
        x = self.pinyin.get_pinyin(city, '')
        url = request.urljoin(self.Url, x)
        now = self.parse_weather_now(url, self.Headers)
        return now

    def get_future_weather(self, city):
        x = self.pinyin.get_pinyin(city, '')
        url = request.urljoin(self.Url, x)
        future = self.parse_weather_7(url, self.Headers, city)
        return future

# w = WeatherParse()
# now = w.get_weather_now('深圳')
# future = w.get_future_weather('上海')
# print(now)
# print('===' * 40 + '\n')
# print(future)
