from flask import jsonify, request, Blueprint
import yfinance as yf
from decimal import Decimal, InvalidOperation
from app.models.schema import HoldingSchema, BalanceSchema
from . import yf_set_interval
from app.controllers import BaseRequest, GraphPoint
from pydantic import BaseModel
from typing import List


class Holding(BaseModel):
    ticker: str
    name: str
    quantity: float
    current_price: float
    average_price: float
    previous_close: float
    opening_price: float
    delta: float
    delta_percentage: float


class InvestingRequest(BaseRequest):
    date_range: str


class InvestingResponse(BaseModel):
    holdings: List[Holding]
    plot_points: List[GraphPoint]
    total_investing: float
    buying_power: float
    delta: float
    delta_percentage: float


inv = Blueprint("investing", __name__)


@inv.route("/investing/<int:user_id>", methods=["GET"])
def investing(user_id):
    date_range = request.args.get("dateRange", "5d")
    interval = yf_set_interval(date_range)
    total_investing = 0

    # Fetch user's holdings and balance
    holdings = HoldingSchema.query.filter_by(user_id=user_id).all() or []
    balance = BalanceSchema.query.filter_by(user_id=user_id).first()

    # Default balance to 0 if none found
    balance_amount = Decimal(balance.balance) if balance else Decimal(0.0)

    # If no holdings, return an empty valid response
    if not holdings:
        no_holdings_response = InvestingResponse(
            holdings=[],
            plot_points=[],
            total_investing=float(balance_amount),
            buying_power=float(balance_amount),
            delta=0,
            delta_percentage=0,
        )
        return no_holdings_response.json(), 200

    # Get stock data from yfinance
    tickers = " ".join(holding.ticker for holding in holdings)
    stock_data = yf.Tickers(tickers)

    # Prepare data
    hist_data = {}
    plot_points = []
    response_holdings = []

    for holding in holdings:
        ticker = holding.ticker
        try:
            # Fetch historical data
            hist = stock_data.tickers[ticker].history(
                period=date_range, interval=interval
            )
            if hist.empty:
                raise Exception("Historical data not found for the given date range.")
            hist_data[ticker] = hist
        except Exception as e:
            return (
                jsonify({"error": f"Error fetching data for {ticker}: {str(e)}"}),
                500,
            )

    # Calculate total value at each plot point (iterate over the first stock's dates)
    reference_ticker = holdings[0].ticker
    for date in hist_data[reference_ticker].index:
        total_value = balance_amount
        for holding in holdings:
            ticker = holding.ticker
            if date in hist_data[ticker].index:
                price = hist_data[ticker].loc[date]["Close"]
                total_value += holding.quantity * Decimal(price)

        try:
            time_fmt = "%H:%M" if date_range == "1d" else "%m-%d-%Y"

            plot_points.append(
                GraphPoint(date=date.strftime(time_fmt), price=float(total_value))
            )
        except InvalidOperation:
            return (
                jsonify({"error": "Invalid operation while calculating total value."}),
                500,
            )

    # Add detailed holdings information
    for holding in holdings:
        ticker = holding.ticker
        stock = stock_data.tickers[ticker]
        info = stock.info
        total_investing += info.get("currentPrice", 0) * float(holding.quantity)
        response_holdings.append(
            Holding(
                ticker=ticker,
                name=info.get("longName", ticker),
                quantity=float(holding.quantity),
                average_price=float(holding.average_price),
                current_price=info.get("currentPrice", 0),
                previous_close=info.get("previousClose", 0),
                opening_price=info.get("open", 0),
                delta=info.get("currentPrice", 0) - info.get("previousClose", 0),
                delta_percentage=(
                    100
                    * (info.get("currentPrice", 0) - info.get("previousClose", 0))
                    / info.get("previousClose", 0)
                ),
            )
        )
        
    delta = plot_points[-1].price - plot_points[0].price
    total_investing = float(Decimal(total_investing) + balance_amount)
    
    response_data = InvestingResponse(
        holdings=response_holdings,
        plot_points=plot_points,
        total_investing=total_investing,
        buying_power=float(balance_amount),
        delta=delta,
        delta_percentage=(delta / total_investing)
        * 100,
    )

    return response_data.json(), 200
