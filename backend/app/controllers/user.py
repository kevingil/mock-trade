from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.schema import db, TransactionSchema

user = Blueprint('user-admin', __name__)

@user.route('/balance/<int:user_id>', methods=['GET'])
def get_balance(user_id):
    if not user_id:
        return jsonify({'error': 'Missing user_id parameter'}), 400
    
    try:
        user = User(int(user_id))
        balance = user.get_balance()
        return jsonify({'balance': balance}), 200
    except ValueError:
        return jsonify({'error': 'Invalid user_id'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@user.route('/deposit', methods=['POST'])
def deposit():
    data = request.get_json()
    user_id = data.get('user_id')
    amount = data.get('amount')

    if not all([user_id, amount]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        user = User(int(user_id))
        user_info = user.get_user()
        if not user_info:
            return jsonify({'error': 'User not found'}), 404

        user.add_balance(float(amount))
        return jsonify({'message': 'Deposit successful'}), 200
    except ValueError:
        return jsonify({'error': 'Invalid user_id or amount'}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@user.route('/history/<int:user_id>', methods=['GET'])
def transaction_history(user_id):

    transactions = TransactionSchema.query.filter_by(user_id=user_id).order_by(TransactionSchema.timestamp.desc()).limit(25).all()
    
    transactions_list = [
        {
            "ticker": txn.ticker,
            "transaction_type": txn.transaction_type,
            "quantity": str(txn.quantity),  
            "price": str(txn.price),
            "timestamp": txn.timestamp.isoformat(),
        }
        for txn in transactions
    ]

    return jsonify(transactions_list), 200
