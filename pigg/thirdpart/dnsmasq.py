import re
import os
import requests
from pigg import settings

# URL = 'http://192.168.27.128:8081'
# BasicAuth = HTTPBasicAuth('admin','admin')


# 重启生效
def restart():
    url = os.path.join(settings.DNS_URL, 'restart')
    try: 
        resp = requests.put(url, auth=settings.DNS_BASICAUTH)
    except Exception as e:
        print('DNS服务连接失败:' + str(e))
        return False
    return True


# 保存到文件但不会生效
def save(data_file, data):
    # 1先在【视图层】判断数据库有无该数据
    # 2没有则调用该方法写记录到文件
    # 3没有问题再在试图层保存记录到数据库
    record = "\naddress=/" + data['domain'] + "/" + data['address']
    with open(data_file, 'a') as f:
        f.write(record)
        f.close()


# 从文件中获取所有域名dns记录
def getList(data_file):
    alldata = []  # 存储所有所有字典
    dataitem = dict()  # 存储域名和地址的字典
    with open(data_file, 'r', encoding='utf-8') as f:
        for row in f.readlines():
            ret = re.match('address[^\s]+', row)
            if ret:
                templist = ret.group().split('/')
                dataitem['domain'] = templist[1]
                dataitem['address'] = templist[2]
                alldata.append(dataitem)
    return alldata


# 请求服务失败后，删除对应数据
def delete(data_file, domain):
    with open(data_file, 'r') as r:
        lines = r.readlines()
        r.close()
    with open(data_file, 'w') as w:
        for line in lines:
            if domain not in line and line != '\n' and line != '':
                w.write(line)
        w.close()


# True:事务正确执行，并成功激活服务
def main(data):
    data_file = settings.DNS_CONFIG
    print('保存记录到文件dnsmasq.conf: %s' % data)
    save(data_file, data)
    # 重启DNS服务
    if restart():  # 正确重启
        return True
    else:
        print('文件回退，删除文件该条记录: %s' % data)
        # 在文件删除记录
        domain = data['domain']
        delete(data_file, domain)
        return False


if __name__ == "__main__":
    data_file = '/opt/pigg/resources/data/dnsmasq.conf'
    # 这两个写入到settings文件夹上
    data = {'domain': 'www.ceshi.com', 'address': '4.3.2.1'}
    # save(data_file, data)
    main(data_file, data)
