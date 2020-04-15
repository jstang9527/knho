#!/bin/bash
# 获取本机IP
curl httpbin.org/ip | grep origin | awk -F'"' '{print $4}' > sshd.log
# 截取sshd爆破记录
cat /var/log/secure|grep Failed >> sshd.log

