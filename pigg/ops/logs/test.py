
# set1 = set(['1.2.2.4', '3.3.3.3', '4.4.4.4'])  # 内存
# set2 = set(['4.3.3.3', '4.4.4.4'])  # 请求
# public = set2 - set1
# print(list(public))
# for i in list(public):
#     print(i)

data1 = ['1.2.2.4', '3.3.3.3', '4.4.4.4']
data2 = '4.4.4.4'
print(data2 in data1)
