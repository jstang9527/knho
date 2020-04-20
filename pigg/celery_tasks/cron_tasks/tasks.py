# cron_tasks/test.py
import os
import sys
import django
sys.path.append('/opt/pigg')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pigg.settings')
django.setup()
from celery import Celery
from ops.analysis import sshd

app = Celery('cron_tasks', broker='redis://localhost/1', backend='redis://localhost/2')
app.config_from_object('cron_tasks.config')


@app.task
def add():
    sshd.sshd_attack_record_toDB()
    return True
