


# With date range  code as input, this returns
# the ideal time interval the frontend line graph
def yf_set_interval(date_range: str):
    interval = ''
    match date_range:
        case '1d':
            interval = '5m'
        case '5d':
            interval = '15m'
        case '1m':
            interval = '1h'
        case '3m':
            interval = '1d'
        case '6m':
            interval = '1d'
        case '1y':
            interval = '1wk'
        case 'max':
            interval = '1mo'
        case _:
            interval = '1d'
    return interval
