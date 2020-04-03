import json
import hashlib
from django.http import JsonResponse
from landns.models import Ldns
from utils.response import CommonResponseMixin, ReturnCode
from django.views import View
from utils.auth import already_authorized
from authorization.models import User
from thirdpart import dnsmasq
from pigg.settings import DNS_CONFIG

# 慎用，将遗弃
def all_record(request):
    query_set = Ldns.objects.all()
    print('query_set', query_set)
    all_dns = []
    for dns in query_set:
        all_dns.append(dns.to_dict())
    print(all_dns)
    response_data = CommonResponseMixin.wrap_json_response(data=all_dns)
    return JsonResponse(data=response_data, safe=False)

# 搜索栏,公共应用
def query_record(request):
    data = []
    domain = request.GET.get('domain').strip()
    domain = domain.strip()
    # 包含就算
    dnss = Ldns.objects.filter(domain__contains=domain)
    for dns in dnss:
        nickname = dns.owner.nickname
        # 加隐私*
        owner = dns.owner.nickname
        owner = ''.join(list(owner)[1:])
        owner = '*' + owner
        data.append({'owner': owner, 'domain': dns.domain, 'address': dns.address})
    response_data = CommonResponseMixin.wrap_json_response(data=data)
    return JsonResponse(data=response_data, safe=False, status=200)  # {"query": "wu.com"}


class UserLdns(View, CommonResponseMixin):
    def get(self, request):
        # 如果未登录，返回未授权
        if not already_authorized(request):
            response = self.wrap_json_response(code=ReturnCode.UNAUTHORIZED)
            return JsonResponse(data=response, safe=False)
        open_id = request.session.get('open_id')
        user = User.objects.get(open_id=open_id)
        # 获取此人所有dns记录,返回列表
        userRecords = user.ldns_set.all()
        data = []
        for userRecord in userRecords:
            data.append({'domain':userRecord.domain, 'address':userRecord.address})
        response_data = self.wrap_json_response(data=data)
        return JsonResponse(data=response_data, safe=False)
    
    def post(self, request):
        if not already_authorized(request):
            response = self.wrap_json_response(code=ReturnCode.UNAUTHORIZED)
            return JsonResponse(data=response, safe=False)
        
        received_body = json.loads(request.body)  #{'data': {'domain': 'www.ceshi.com', 'address': '4.3.2.1'}} 
        received_body = received_body.get('data')  # {'domain': 'www.ceshi.com', 'address': '4.3.2.1'}
        print(received_body.get('domain'), received_body.get('address'))
        
        # 在文件中保存
        dnsmasq.main(received_body)

        domain = received_body.get('domain')
        address = received_body.get('address')
        ldnsid = hashlib.md5(domain.encode('utf8')).hexdigest()
        open_id = request.session.get('open_id')
        user = User.objects.get(open_id=open_id)
        
        new_ldns = Ldns(owner=user, ldnsid=ldnsid, domain=domain, address=address)
        new_ldns.save()

        response_data = self.wrap_json_response(code=ReturnCode.SUCCESS)
        return JsonResponse(data=response_data, safe=False)
    
    def delete(self, request):
        if not already_authorized(request):
            response = self.wrap_json_response(code=ReturnCode.UNAUTHORIZED)
            return JsonResponse(data=response, safe=False)
        
        domain = request.GET.get('domain').strip()
        # 先在文件中删除该记录，再删数据库记录
        dnsmasq.delete(DNS_CONFIG, domain)
        dnsmasq.restart()
        
        ldnsid = hashlib.md5(domain.encode('utf8')).hexdigest()
        Ldns.objects.get(ldnsid=ldnsid).delete()
        response_data = self.wrap_json_response(code=ReturnCode.SUCCESS)
        
        return JsonResponse(data=response_data, safe=False)
    