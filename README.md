# KNHO
DevOps 小程序

异步框架：celery  
依赖主机服务： mysql  
依赖容器服务：dnsmasq、clamd、redis-server、prometheus、cadvisor、grafana、node-export  

---
#### 项目启动：  
##### 1.项目根目录下，即lmanage.py文件同级  
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

##### 4启动后台  
python3 manage.py runserver 0.0.0.0:8000  
