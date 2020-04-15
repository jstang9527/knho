from django.db import models


# 创建威胁表
class Ithreat(models.Model):
    # id
    ithreat_id = models.AutoField(primary_key=True)
    # 攻击类型[ssh爆破、刷站、syn]
    name = models.CharField(max_length=128)
    # 攻击次数
    times = models.IntegerField()
    
    # 攻击者ip
    attack = models.GenericIPAddressField()
    # 攻击者中文地址
    cn_attack_area = models.CharField(max_length=128)
    # 攻击者英文地址
    en_attack_area = models.CharField(max_length=128)

    # 受害者ip
    victim = models.GenericIPAddressField()
    # 受害者中文地址
    cn_victim_area = models.CharField(max_length=128)
    # 受害者英文地址
    en_victim_area = models.CharField(max_length=128)
    
    # 初始攻击时间 auto_now=True
    attackMT = models.DateTimeField()
    # 最后攻击时间
    last_attackMT = models.DateTimeField()

    def __str__(self):
        return "%s {'攻击者': %s(%s), '受害者': %s(%s), 攻击时间[%s ~ %s]}, 攻击次数:【%s】" % (self.name, self.attack, self.cn_attack_area, self.victim, self.cn_victim_area, self.attackMT, self.last_attackMT, self.times)
    
    def __repr__(self):
        return str(self.to_dict())

# # 告警表， 废除，直接在promSQL进行查询
# class (models.Model):
#     # 唯一ID，自增主键
#     alter_id = models.AutoField(primary_key=True)
#     # 主机
#     instance = models.CharField(max_length=128)
#     # 告警内容
#     content = models.TextField()
#     # 告警时间
#     alterMT = models.DateTimeField()
#     # 热度
#     alterNum = models.IntegerField()

#     def to_dict(self):
#         return {
#             'alter_id': self.alter_id,
#             'instance': self.instance,
#             'content': self.content,
#             'alterMT': self.alterMT,
#             'alterNum': self.alterNum,
#         }

#     def __str__(self):
#         return '%s[%s]' % (self.instance, self.alterNum)

#     def __repr__(self):
#         return str(self.to_dict())
