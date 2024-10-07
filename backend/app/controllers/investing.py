from flask import jsonify, request, Blueprint
import yfinance as yf
from decimal import Decimal, InvalidOperation
from app.models.schema import HoldingSchema, BalanceSchema

inv = Blueprint("investing", __name__)

@inv.route("/investing/<int:user_id>", methods=["GET"])
def investing(user_id):
    date_range = request.args.get("dateRange", "5d")
    total_investing = 0

    # Fetch user's holdings and balance
    holdings = HoldingSchema.query.filter_by(user_id=user_id).all()
    balance = BalanceSchema.query.filter_by(user_id=user_id).first()

    if not holdings or not balance:
        return jsonify({"error": "User not found or no holdings available"}), 404

    # Get stock data from yfinance
    tickers = " ".join(holding.ticker for holding in holdings)  # Create a space-separated string of tickers
    stock_data = yf.Tickers(tickers)

    # Prepare historical data dictionary
    hist_data = {}
    
    for holding in holdings:
        ticker = holding.ticker
        try:
            interval = ''
            match date_range:
                case '1d':
                    interval = '5m'
                case '5d':
                    interval = '15m'
                case '1m':
                    interval = '1h'
                case '3m':
                    interval = '1d'
                case '6m':
                    interval = '1d'
                case '1y':
                    interval = '1wk'
                case 'max':
                    interval = '1mo'
                case _:
                    interval = '1d'
            
            # Fetch historical data
            hist = stock_data.tickers[ticker].history(period=date_range, interval=interval)
            if hist.empty:
                return (
                    jsonify({"error": f"No historical data found for {ticker}"}),
                    404,
                )
            hist_data[ticker] = hist  # Store historical data by ticker
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
        total_value = Decimal(balance.balance)
        for holding in holdings:
            ticker = holding.ticker
            if date in hist_data[ticker].index:  # Check if date exists for ticker
                price = hist_data[ticker].loc[date]["Close"]  # Access price safely
                total_value += holding.quantity * Decimal(price)

        # Safely convert to float for JSON response
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
        stock = stock_data.tickers[ticker]  # Use the Tickers object
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

    response_data["total_investing"] = float(Decimal(total_investing) + balance.balance)
    response_data["buying_power"] = float(balance.balance)

    return jsonify(response_data)
