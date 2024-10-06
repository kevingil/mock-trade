from app.models.schema import db, UserSchema, BalanceSchema, HoldingSchema
from sqlalchemy.exc import NoResultFound
from decimal import Decimal

class User:
    def __init__(self, user_id):
        self.user_id = user_id

    def get_user(self):
        try:
            return UserSchema.query.filter_by(id=self.user_id).one()
        except NoResultFound:
            return None

    def add_balance(self, amount: float):
        amount_decimal = Decimal(str(amount))
        balance = BalanceSchema.query.filter_by(user_id=self.user_id).first()
        if balance:
            balance.balance += amount_decimal  
        else:
            balance = BalanceSchema(user_id=self.user_id, balance=amount)
            db.session.add(balance)
        db.session.commit()

    def get_balance(self):
        balance = BalanceSchema.query.filter_by(user_id=self.user_id).first()
        return float(balance.balance) if balance else 0.0

    def get_investing_list(self):
        holdings = HoldingSchema.query.filter_by(user_id=self.user_id).all()
        return [(holding.ticker, float(holding.quantity)) for holding in holdings]

    def get_holding_amount(self, ticker):
        holding = HoldingSchema.query.filter_by(user_id=self.user_id, ticker=ticker).first()
        return float(holding.quantity) if holding else 0.0
