from flask import jsonify, request, Blueprint
import yfinance as yf
from decimal import Decimal, InvalidOperation
from app.models.schema import HoldingSchema, BalanceSchema
from . import yf_set_interval

inv = Blueprint("investing", __name__)

@inv.route("/investing/<int:user_id>", methods=["GET"])
def investing(user_id):
    date_range = request.args.get("dateRange", "5d")
    total_investing = 0

    # Fetch user's holdings and balance
    holdings = HoldingSchema.query.filter_by(user_id=user_id).all() or []
    balance = BalanceSchema.query.filter_by(user_id=user_id).first()

    # Default balance to 0 if none found
    balance_amount = Decimal(balance.balance) if balance else Decimal(0.0)

    # If no holdings, return an empty valid response 
    if not holdings:
        response_data = {
            "holdings": [],
            "plot_points": [],
            "total_investing": float(balance_amount),
            "buying_power": float(balance_amount),
        }
        return jsonify(response_data)

    # Get stock data from yfinance
    tickers = " ".join(holding.ticker for holding in holdings)  
    stock_data = yf.Tickers(tickers)

    # Prepare historical data dictionary
    hist_data = {}
    
    for holding in holdings:
        ticker = holding.ticker
        try:
            interval = yf_set_interval(date_range)
            
            # Fetch historical data
            hist = stock_data.tickers[ticker].history(period=date_range, interval=interval)
            if hist.empty:
                raise Exception("Historical data not found for the given date range.")
            hist_data[ticker] = hist 
        except Exception as e:
            return (
                jsonify({"error": f"Error fetching data for {ticker}: {str(e)}"}),
                500,
            )

    # Prepare the response data
    response_data = {"holdings": [], "plot_points": []}

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
            response_data["plot_points"].append(
                {"date": date.strftime("%Y-%m-%d"), "total_value": float(total_value)}
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
        response_data["holdings"].append(
            {
                "ticker": ticker,
                "name": info.get("longName", ticker),
                "quantity": float(holding.quantity),
                "average_price": float(holding.average_price),
                "current_price": info.get("currentPrice", 0),
            }
        )

    response_data["total_investing"] = float(Decimal(total_investing) + balance_amount)
    response_data["buying_power"] = float(balance_amount)
    response_data["delta"] = response_data["plot_points"][-1]["total_value"] - response_data["plot_points"][0]["total_value"]
    response_data["delta_percent"] = (response_data["delta"] / response_data["total_investing"]) * 100
    
    
    print(response_data['delta'])

    return jsonify(response_data)
