from flask import request, jsonify, Blueprint
import yfinance as yf
import datetime
from dateutil.relativedelta import relativedelta

tickets = Blueprint('tickets', __name__)

def parse_date_range(date_range_code):
    today = datetime.datetime.now()
    if date_range_code == '1d':
        return today - datetime.timedelta(days=1), today
    elif date_range_code == '1w':
        return today - datetime.timedelta(weeks=1), today
    elif date_range_code == '1m':
        return today - relativedelta(months=1), today
    elif date_range_code == '3m':
        return today - relativedelta(months=3), today
    elif date_range_code == 'ytd':
        return datetime.datetime(today.year, 1, 1), today
    elif date_range_code == '5y':
        return today - relativedelta(years=5), today
    elif date_range_code == 'max':
        return '1900-01-01', today  # Arbitrary old date to get all available data
    else:
        raise ValueError("Invalid dateRange code.")
    

@tickets.route('/get-stock-data', methods=['GET'])
def get_stock_chart():
    # Get parameters from request
    ticket_code = request.args.get('ticketCode')
    date_range = request.args.get('dateRange')
    
    # Validate parameters
    if not ticket_code or not date_range:
        return jsonify({'error': 'ticketCode and dateRange are required parameters'}), 400
    
    try:
        start_date, end_date = parse_date_range(date_range)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
    # Fetch stock data using yfinance
    try:
        stock_data = yf.download(ticket_code, start=start_date, end=end_date)
        ticker = yf.Ticker(ticket_code)

        if stock_data.empty:
            return jsonify({'error': 'No data found for the given ticketCode and dateRange'}), 404
        
        # Prepare data for charting (dates and closing prices)
        chart_data = {
            'dates': stock_data.index.strftime('%Y-%m-%d').tolist(),
            'closing_prices': stock_data['Close'].tolist(),
            'name': ticker.info['longName']
        }
        return jsonify(chart_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


