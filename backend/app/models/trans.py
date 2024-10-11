from app.models.schema import db, TransactionSchema, HoldingSchema, BalanceSchema

class Transaction:
    def __init__(self, user_id):
        self.user_id = user_id

    def transaction_history(self):
        return TransactionSchema.query.filter_by(user_id=self.user_id).order_by(TransactionSchema.timestamp.desc()).all()


'''

def transaction_history(self, page):
    page_size = 25
    offset = (page - 1) * page_size
    
    query = """
    SELECT *
    FROM transactions
    WHERE user_id = :user_id
    ORDER BY timestamp DESC
    LIMIT :page_size OFFSET :offset;
    """
    
    result = db.session.execute(query, {
        'user_id': self.user_id,
        'page_size': page_size,
        'offset': offset
    })
    
    return result.fetchall()

'''
