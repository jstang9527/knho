# config.py
from datetime import timedelta

CELERYBEAT_SCHEDULE = {
    'analysis_sshd_logs': {
        'task': 'cron_tasks.tasks.add',  # 你注册的应用名+模块名+函数，app = Celery('cron_tasks', broker='', backend='')
        'schedule': timedelta(seconds=60 * 5),  # 单位秒
    },
}
