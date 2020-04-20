aa = {'124.172.152.128': 66, '47.92.255.39': 22, '192.168.47.127': 78, '172.32.55.178': 70}
aa = sorted(aa.items(), key=lambda asd: asd[1], reverse=True)[:2]
# aa = aa[:2]
xa = {'data': [], 'categories': []}
aa = dict(aa)
for k, v in aa.items():
    xa['data'].append(v)
    xa['categories'].append(k)
print(xa)
