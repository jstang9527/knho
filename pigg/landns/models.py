from django.db import models
from authorization.models import User


# dns记录
class Ldns(models.Model):
    # 1个用户可以拥有多条记录, 1条记录只能被一个用户拥有，那么就需要设置用户为外键
    # 用户被删除时，名下DNS记录也被删除
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    ldnsid = models.CharField(primary_key=True, max_length=32)  # 唯一ID
    domain = models.CharField(max_length=128)  # 域名
    address = models.CharField(max_length=128)  # 解析地址
    
    def to_dict(self):
        return {
            'ldnsid': self.ldnsid,
            'domain': self.domain,
            'address': self.address
        }

    def __str__(self):
        return '%s' % self.domain

    def __repr__(self):
        return str(self.to_dict())
