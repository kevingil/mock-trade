from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
import yfinance as yf
from app.models.trans import Transaction
from app.models.user import User

trans = Blueprint('transactions', __name__)

@trans.route('/transaction', methods=['POST'])
def transaction():
    data = request.get_json()
    user_id = data.get('user_id')
    ticker = data.get('ticker')
    transaction_type = data.get('transaction_type')
    quantity = data.get('quantity')

    if not all([user_id, ticker, transaction_type, quantity]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        user_id = int(user_id)
        quantity = float(quantity)
        user = User(user_id)
        user_info = user.get_user()
        if not user_info:
            return jsonify({'error': 'User not found'}), 404

        # Get current stock price
        stock = yf.Ticker(ticker)
        current_price = stock.info['regularMarketPrice']

        transaction = Transaction(user_id)

        if transaction_type == 'BUY':
            if user.get_balance() < quantity * current_price:
                return jsonify({'error': 'Insufficient balance'}), 400
            transaction.buy_stock(ticker, quantity)
        elif transaction_type == 'SELL':
            if user.get_holding_amount(ticker) < quantity:
                return jsonify({'error': 'Insufficient stock quantity'}), 400
            transaction.sell_stock(ticker, quantity)
        else:
            return jsonify({'error': 'Invalid transaction type'}), 400

        return jsonify({'message': 'Transaction successful', 'price': current_price}), 200

    except ValueError:
        return jsonify({'error': 'Invalid input data'}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@trans.route('/history', methods=['GET'])
def transaction_history():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'Missing user_id parameter'}), 400

    try:
        user_id = int(user_id)
        transaction = Transaction(user_id)
        history = transaction.transaction_history()
        return jsonify({'history': [
            {
                'id': t.id,
                'ticker': t.ticker,
                'transaction_type': t.transaction_type,
                'quantity': float(t.quantity),
                'price': float(t.price),
                'timestamp': t.timestamp.isoformat()
            } for t in history
        ]}), 200
    except ValueError:
        return jsonify({'error': 'Invalid user_id'}), 400
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500
