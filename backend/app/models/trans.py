from app.models.schema import db, TransactionSchema, HoldingSchema, BalanceSchema

class Transaction:
    def __init__(self, user_id):
        self.user_id = user_id

    def buy_stock(self, ticker, amount, current_price):
        # Assuming the current price is fetched from somewhere
        
        # Check if user has enough balance
        balance = BalanceSchema.query.filter_by(user_id=self.user_id).first()
        if not balance or balance.balance < current_price * amount:
            raise ValueError("Insufficient balance")

        # Update balance
        balance.balance -= current_price * amount
        
        # Update or create holding
        holding = HoldingSchema.query.filter_by(user_id=self.user_id, ticker=ticker).first()
        if holding:
            total_value = (holding.quantity * holding.average_price) + (amount * current_price)
            holding.quantity += amount
            holding.average_price = total_value / holding.quantity
        else:
            holding = HoldingSchema(user_id=self.user_id, ticker=ticker, quantity=amount, average_price=current_price)
            db.session.add(holding)

        # Record transaction
        transaction = TransactionSchema(
            user_id=self.user_id,
            ticker=ticker,
            transaction_type='BUY',
            quantity=amount,
            price=current_price
        )
        db.session.add(transaction)
        db.session.commit()

    def sell_stock(self, ticker, amount, current_price):
        holding = HoldingSchema.query.filter_by(user_id=self.user_id, ticker=ticker).first()
        if not holding or holding.quantity < amount:
            raise ValueError("Insufficient stocks to sell")

        # Update holding
        holding.quantity -= amount
        if holding.quantity == 0:
            db.session.delete(holding)

        # Update balance
        balance = BalanceSchema.query.filter_by(user_id=self.user_id).first()
        if balance:
            balance.balance += current_price * amount
        else:
            balance = BalanceSchema(user_id=self.user_id, balance=current_price * amount)
            db.session.add(balance)

        # Record transaction
        transaction = TransactionSchema(
            user_id=self.user_id,
            ticker=ticker,
            transaction_type='SELL',
            quantity=amount,
            price=current_price
        )
        db.session.add(transaction)
        db.session.commit()

    def transaction_history(self):
        return TransactionSchema.query.filter_by(user_id=self.user_id).order_by(TransactionSchema.timestamp.desc()).all()

