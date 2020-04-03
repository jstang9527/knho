from django.urls import path
from .views import clamav, weather, menu
from .views.prometheus import vector

urlpatterns = [
    path('clamav/taskid_list', clamav.get_taskId_list, name='get_taskid_list'),
    path('clamav/multiscan', clamav.MultiClamdView.as_view(), name='multi_clamd_service'),
    path('clamav/scanfile', clamav.FileView.as_view(), name='scan_single_file_in_primary'),
    path('clamav/task/<str:task_id>/', clamav.TaskView.as_view(), name='get_task_status'),
    path('clamav/version', clamav.getVersion),

    path('weather', weather.WeatherView.as_view()),
    path('menu/list', menu.all_menu),
    path('hello', weather.helloworld),
    path('menu/user', menu.UserMenu.as_view()),

    path('prom/uptime', vector.get_host_uptime),  # prom/uptime?host=localhost
    path('prom/containers', vector.get_host_containers),
    path('prom/cpu_guage', vector.get_host_cpu_guage),
    path('prom/cpuload_guage', vector.get_host_cpuload_guage),
    path('prom/mem_guage', vector.get_host_mem_guage),
    path('prom/disk_guage', vector.get_host_disk_guage),

    # 指定主机下的所有容器
    path('prom/container/cpu_matrix', vector.get_host_disk_guage),  # prom/container/cpu_matrix?host=localhost
    path('prom/container/mem_matrix', vector.get_host_disk_guage),
    path('prom/host/list', vector.get_host_disk_guage),
]
