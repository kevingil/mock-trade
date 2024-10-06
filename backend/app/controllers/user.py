from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from app.models.user import User
from app.models.schema import db

user = Blueprint('user-admin', __name__)

@user.route('/balance', methods=['GET'])
def get_balance():
    user_id = request.args.get('user_id')
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

