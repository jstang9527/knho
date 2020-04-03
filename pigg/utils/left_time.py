def left_time(value):
    value = float(value)
    hours = value % (60 * 60 * 24)  # 不足24小时的余数
    day = int((value - hours) / (60 * 60 * 24))  # 多少天

    minutes = hours % (60 * 60)  # 不足1小时的余数
    hour = int(hours / (60 * 60))  # 多少小时

    seconds = int(minutes % 60)                  # 不足一分钟的余数，就是秒咯
    minute = int(minutes / 60)  # 多少分钟

    # print('%s:%s:%s:%s' % (day, hour, minute, seconds))
    data = {'days': day, 'hours': hour, 'minutes': minute, 'seconds': seconds}
    return data


if __name__ == "__main__":
    print(left_time(30))
