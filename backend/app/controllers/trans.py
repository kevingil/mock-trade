from flask import jsonify, request, Blueprint
from sqlalchemy.exc import IntegrityError
from decimal import Decimal
from app.models.schema import UserSchema, BalanceSchema, HoldingSchema, TransactionSchema
from app import db


trans = Blueprint('transactions', __name__)

@trans.route('/transaction', methods=['POST'])
def transaction():
    data = request.get_json()
    user_id = data.get('userId')
    ticker = data.get('tickerCode')
    transaction_type = data.get('transactionType')
    quantity = data.get('sharesQuantity')
    current_price = data.get('currentPrice')

    if not all([user_id, ticker, transaction_type, quantity, current_price]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        user_id = int(user_id)
        quantity = Decimal(str(quantity))
        current_price = Decimal(str(current_price))

        user = db.session.query(UserSchema).filter_by(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        total_amount = quantity * current_price

        with db.session.begin_nested():
            if transaction_type == 'BUY':
                balance = db.session.query(BalanceSchema).filter_by(user_id=user_id).first()
                if not balance or balance.balance < total_amount:
                    return jsonify({'error': 'Insufficient balance'}), 400

                balance.balance -= total_amount
                db.session.add(balance)

                holding = db.session.query(HoldingSchema).filter_by(user_id=user_id, ticker=ticker).first()
                if holding:
                    total_quantity = holding.quantity + quantity
                    total_value = (holding.quantity * holding.average_price) + total_amount
                    holding.average_price = total_value / total_quantity
                    holding.quantity = total_quantity
                else:
                    holding = HoldingSchema(user_id=user_id, ticker=ticker, quantity=quantity, average_price=current_price)
                db.session.add(holding)

            elif transaction_type == 'SELL':
                holding = db.session.query(HoldingSchema).filter_by(user_id=user_id, ticker=ticker).first()
                if not holding or holding.quantity < quantity:
                    return jsonify({'error': 'Insufficient stock quantity'}), 400

                holding.quantity -= quantity
                if holding.quantity == 0:
                    db.session.delete(holding)
                else:
                    db.session.add(holding)

                balance = db.session.query(BalanceSchema).filter_by(user_id=user_id).first()
                if balance:
                    balance.balance += total_amount
                else:
                    balance = BalanceSchema(user_id=user_id, balance=total_amount)
                db.session.add(balance)

            else:
                return jsonify({'error': 'Invalid transaction type'}), 400

            transaction = TransactionSchema(
                user_id=user_id,
                ticker=ticker,
                transaction_type=transaction_type,
                quantity=quantity,
                price=current_price
            )
            db.session.add(transaction)

        db.session.commit()
        return jsonify({'message': 'Transaction successful', 'price': float(current_price)}), 200

    except ValueError:
        return jsonify({'error': 'Invalid input data'}), 400
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500
