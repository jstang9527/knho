#!/bin/bash
ls sshd.log 2> /dev/null
if [ $? -ne 0 ];then
    # 获取本机IP
    echo "新建sshd.log文件"
    curl httpbin.org/ip | grep origin | awk -F'"' '{print $4}' > sshd.log
fi    
# 截取sshd爆破记录
cat /var/log/secure|grep Failed >> sshd.log
