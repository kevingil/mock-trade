from flask import Blueprint, request, jsonify
import yfinance as yf
from app.models.schema import TickerSchema
from sqlalchemy import or_


search = Blueprint('search', __name__)

@search.route('/search-tickets', methods=['GET'])
def search_tickets():
    keyword = request.args.get('keyword')
    yfinance_ticket = {}
    yfinance_ticket_code = ''
    results = []
    
    # Validate the keyword parameter
    if not keyword:
        return jsonify({'error': 'Keyword is a required parameter'}), 400
    
    # Use yfinance to search for tickets (ticker symbols)
    try:
        tickets = yf.Ticker(keyword)
        info = tickets.info
        
        # Extract ticket code and name information from the response
        if 'symbol' in info:
            yfinance_ticket = {
                'ticketCode': info['symbol'],
                'ticketName': info['shortName']
            }
    
    except Exception as e:
        print(f"No exact match: {e}")
        yfinance_ticket = {}
            
    # Search for similar tickets in the database
    similar_tickets = TickerSchema.query.filter(
        or_(
            TickerSchema.symbol.ilike(f"%{keyword}%"),
            TickerSchema.name.ilike(f"%{keyword}%"),
            TickerSchema.name.contains(keyword)
        )
    ).limit(10).all()
    
    if 'ticketCode' in yfinance_ticket:
        yfinance_ticket_code = yfinance_ticket['ticketCode']
    
    # Format similar tickets data, avoiding duplicates
    similar_tickets_data = [
        {
            'ticketCode': ticket.symbol,
            'ticketName': ticket.name
        }
        for ticket in similar_tickets
        if ticket.symbol != yfinance_ticket_code
    ]

    # Combine the results
    if 'ticketCode' in yfinance_ticket:
        results = [yfinance_ticket] + similar_tickets_data
    else:
        results = similar_tickets_data
    
    return jsonify(results) if results else jsonify([]) 
            
    
