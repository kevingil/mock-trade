from flask import Blueprint, request, jsonify
import yfinance as yf


search = Blueprint('search', __name__)


@search.route('/search-tickets', methods=['GET'])
def search_tickets():
    keyword = request.args.get('keyword')
    
    # Validate the keyword parameter
    if not keyword:
        return jsonify({'error': 'Keyword is a required parameter'}), 400
    
    # Use yfinance to search for tickets (ticker symbols)
    try:
        tickets = yf.Ticker(keyword)
        info = tickets.info
        
        # Extract ticket code and name information from the response
        if 'symbol' in info:
            ticket_data = {
                'ticketCode': info['symbol'],
                'ticketName': info['shortName']
            }
            return jsonify(ticket_data)
        else:
            return jsonify({'msg': 'No ticker found'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
