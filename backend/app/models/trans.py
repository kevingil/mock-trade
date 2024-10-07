from app.models.schema import db, TransactionSchema, HoldingSchema, BalanceSchema

class Transaction:
    def __init__(self, user_id):
        self.user_id = user_id

    def transaction_history(self):
        return TransactionSchema.query.filter_by(user_id=self.user_id).order_by(TransactionSchema.timestamp.desc()).all()

