# import time
import pyclamd
from threading import Thread


def version(agent_ip):
    cd = pyclamd.ClamdNetworkSocket(agent_ip, 3310)
    version = 'Clamd service not available'
    if cd.ping():
        version = cd.version()
    return version


def clamavScan(ip_list, scan_type, filepath):
    threadlist = []
    result = []
    i = 1
    for ip in ip_list:
        currp = ClamavThread(agent_ip=ip, scan_type=scan_type, filepath=filepath)
        threadlist.append(currp)
        if i == len(ip_list):
            # 全部实例化后再往下走
            for task in threadlist:
                # 启动线程
                task.start()
            for task in threadlist:
                data = dict()
                task.join()
                data['ip'] = task.agent_ip
                data['status'] = task.status
                data['version'] = task.version
                data['connstr'] = task.connstr
                data['scanresult'] = task.scanresult
                result.append(data)
            threadlist = []
        i += 1
    return result


# 连接扫描文件or文件夹
class ClamavThread(Thread):
    # @parms file: file or dir
    def __init__(self, agent_ip, scan_type, filepath):
        Thread.__init__(self)
        self.agent_ip = agent_ip
        self.scan_type = scan_type
        self.file = filepath
        self.connstr = ''
        self.scanresult = ''
        self.status = ''
        self.version = ''

    def run(self):
        try:
            cd = pyclamd.ClamdNetworkSocket(self.agent_ip, 3310)
            if cd.ping():
                self.connstr = self.agent_ip + ' connection [ok]'
                self.status = 'success'
                self.version = cd.version()

                # if self.isReload:  # 需要重载
                #     # load vrius'databases
                #     cd.reload()

                if self.scan_type == "contscan_file":
                    self.scanresult = "{0}".format(cd.contscan_file(self.file))
                elif self.scan_type == "multiscan_file":
                    self.scanresult = "{0}".format(cd.multiscan_file(self.file))
                elif self.scan_type == "scan_file":
                    self.scanresult = "{0}".format(cd.scan_file(self.file))
            else:
                self.connstr = self.agent_ip + 'Ping Error, Exit.'
                self.status = 'failed'
                return
        except Exception as e:
            self.connstr = self.agent_ip + ' ' + str(e)
            self.status = 'failed'


# reload测试专用
def reloadDB(agent_ip):
    data = dict()
    data['agent'] = agent_ip
    data['version'] = 'service not found.'
    data['status'] = 'failed'
    try:
        cd = pyclamd.ClamdNetworkSocket(agent_ip, 3310)
        if cd.ping():
            data['connstr'] = agent_ip + ' connection [ok]'
            data['status'] = 'success'
            data['version'] = cd.version()
            cd.reload()
        else:
            data['connstr'] = agent_ip + 'Ping Error, Exit.'
    except Exception as e:
        data['connstr'] = agent_ip + ' ' + str(e)
    
    return data
