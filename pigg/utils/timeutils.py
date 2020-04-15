import time
import datetime


def get_day_left_in_second():
    """
    返回一天剩余的时间(单位: s)
    :return:
    """
    now = datetime.datetime.now()
    tomorrow = now + datetime.timedelta(days=1)  # 设定+1天
    tomorrow_zero = datetime.datetime(tomorrow.year, tomorrow.month, tomorrow.day, 0, 0, 0)
    left = tomorrow_zero - now
    return int(left.total_seconds())


def get_month_left_in_second():
    """
    返回一个月剩余时间
    :return:
    """
    now = datetime.datetime.now()
    next_month = now + datetime.timedelta(days=31)
    next_month_zero = datetime.datetime(next_month.year, next_month.month, next_month.day, 0, 0, 0)
    left = next_month_zero - now
    print(left)
    return int(left.total_seconds())


def standard_time(year, month, day, sfm):
    '''
    @parmas sfm: 时分秒
    转成可以给DateTimeFiled赋值的日期时间格式
    :return:
    '''
    str_time = str(year) + '/' + str(month) + '/' + str(day) + ' ' + sfm
    struct_time = time.strptime(str_time, '%Y/%b/%d %H:%M:%S')
    t = time.mktime(struct_time)
    t = datetime.datetime.fromtimestamp(t)
    return t


if __name__ == '__main__':
    # get_day_left_in_second()
    get_month_left_in_second()
