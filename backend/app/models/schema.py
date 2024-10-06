from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey, DECIMAL, Integer, Column, Integer, Enum
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func


db = SQLAlchemy()

class UserSchema(db.Model):
    __tablename__ = 'users'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), default='member', nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime, nullable=True)

class BalanceSchema(db.Model):
    __tablename__ = 'user_balances'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    balance = Column(DECIMAL(15, 2), default=0, nullable=False)
    updated_at = Column(DateTime, default=func.now(), nullable=False)


class HoldingSchema(db.Model):
    __tablename__ = 'stock_holdings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    ticker = Column(String(10), nullable=False)
    quantity = Column(DECIMAL(15, 6), nullable=False)
    average_price = Column(DECIMAL(15, 2), nullable=False)
    updated_at = Column(DateTime, default=func.now(), nullable=False)

class TransactionSchema(db.Model):
    __tablename__ = 'stock_transactions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    ticker = Column(String(10), nullable=False)
    transaction_type = Column(Enum('BUY', 'SELL', name='transaction_type_enum'), nullable=False)
    quantity = Column(DECIMAL(15, 6), nullable=False)
    price = Column(DECIMAL(15, 2), nullable=False)
    timestamp = Column(DateTime, default=func.now(), nullable=False)

class TickerSchema(db.Model):
    __tablename__ = 'tickers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(10), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    country = Column(String(100), nullable=True)
    ipoyear = Column(String(4), nullable=True)
    industry = Column(String(100), nullable=True)
    sector = Column(String(100), nullable=True)
