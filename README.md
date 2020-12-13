# KNHO
## applet小程序  
## pigg小程序后端  
### Description：
该小程序主要功能有: 基于用户的域名解析、文件病毒检索、监控告警(容器、主机)、知识库等小功能

### Require:
- Python3.7  
- Django2.0(>=2.0)
- Celery  
- Mysql  
- Docker

### Install:  
##### 1.项目根目录下，即manage.py文件同级  
[root@knho pigg]#supervisord  
##### 2.启动mysql服务  
[root@knho pigg]#systemctl restart mysqld  
##### 3.启动容器服务  
##### 3.1启动dns  
[root@knho pigg]#docker load < `pwd`/dnsmasq.tar  
[root@knho pigg]#docker run --name dnsmasq -d -p 53:53/udp -p 8081:8080 -v /opt/pigg/resources/data/dnsmasq.conf:/etc/dnsmasq.conf -e "HTTP_USER=admin" -e "HTTP_PASS=admin" --restart always jpillora/dnsmasq  
##### 3.2启动clamd  
[root@knho pigg]#docker run -itd --name clamd -v /opt/pigg/resources/tmpfiles:/opt/pigg/resources/tmpfiles -p 3310:3310 clamd  
##### 3.3启动redis-server  
[root@knho pigg]#docker run -itd --name redis-server -p 6379:6379 redis  
##### 3.4启动prometheus  
[root@knho pigg]#docker run -d -p 9090:9090 -v /opt/pigg/resources/data/prometheus.yml:/etc/prometheus/prometheus.yml --name prometheus --net=host prom/prometheus  
##### 3.5启动cadvisor  
[root@knho pigg]#docker run --volume=/:/rootfs:ro --volume=/var/run:/var/run:rw --volume=/sys:/sys:ro --                     volume=/var/lib/docker/:/var/lib/docker:ro --detach=true --name=cadvisor --net=host google/cadvisor:latest  
##### 3.6启动grafana  
[root@knho pigg]#docker run -d -p 3000:3000 --name=grafana --network host -e "GF_AUTH_BASIC_ENABLED=true" -e "GF_AUTH_ANONYMOUS_ENABLED=false"  grafana/grafana:4.2.0  
##### 3.7启动node-export  
[root@knho pigg]#docker run -d  -v "/proc:/host/proc" -v "/sys:/host/sys" -v "/:/rootfs" --name node-export --net=host prom/node-exporter --path.procfs /host/proc --path.sysfs /host/sys --collector.filesystem.ignored-mount-points "^/(sys|proc|dev|host|etc)($|/)"  
##### 3.8启动后台  
python3 manage.py runserver 0.0.0.0:8000  
### Publish
由于小程序的后端API接口必须走443端口，所以需要配置安全证书(需要域名并进行申请证书)，进行服务上线。  
详情见本人博客[HTTPS + Nginx + uWgsi(HA) + Django](https://blog.csdn.net/qq_38900565/article/details/104603838)
