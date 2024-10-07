from flask import request, jsonify, Blueprint
import yfinance as yf
import datetime
from decimal import Decimal
from app.models.schema import HoldingSchema

tickets = Blueprint("tickets", __name__)


@tickets.route("/get-stock-data", methods=["GET"])
def get_stock_chart():
    # Get parameters from request
    ticket_code = request.args.get("ticketCode")
    date_range = request.args.get("dateRange")
    user_id = request.args.get("userId")

    # Validate parameters
    if not ticket_code or not date_range:
        return (
            jsonify({"error": "ticketCode and dateRange are required parameters"}),
            400,
        )

    # Fetch stock data using yfinance
    try:

        interval = ""
        match date_range:
            case "1d":
                interval = "5m"
            case "5d":
                interval = "15m"
            case "1m":
                interval = "1h"
            case "3m":
                interval = "1d"
            case "6m":
                interval = "1d"
            case "1y":
                interval = "1wk"
            case "max":
                interval = "1mo"
            case _:
                interval = "1d"

        ticker = yf.Ticker(ticket_code)
        stock_data = ticker.history(period=date_range, interval=interval)
        current_price = ticker.info.get("currentPrice")  # Fetch the current price

        # If no historical data is available for the given date range
        if stock_data.empty:
            # If current price is available, return it as the only data point
            if current_price:
                return (
                    # Return the current price as the only data point twice
                    # to show the current price in the chart as a line
                    jsonify(
                        {
                            "dates": [datetime.datetime.now().strftime("%Y-%m-%d")],
                            "closing_prices": [current_price],
                            "name": ticker.info.get("longName", "Unknown"),
                        },
                        {
                            "dates": [datetime.datetime.now().strftime("%Y-%m-%d")],
                            "closing_prices": [current_price],
                            "name": ticker.info.get("longName", "Unknown"),
                        },
                    ),
                    200,
                )
            else:
                return (
                    jsonify(
                        {
                            "error": "No data found for the given ticketCode and dateRange"
                        }
                    ),
                    404,
                )

        # Prepare data for charting (dates and closing prices)
        chart_data = {
            "dates": stock_data.index.strftime("%Y-%m-%d").tolist(),
            "closing_prices": stock_data["Close"].tolist(),
            "name": ticker.info.get("longName", "Unknown"),
        }

        # Calculate shares_holding and portfolio_percentage
        holdings = HoldingSchema.query.filter_by(
            user_id=user_id, ticker=ticket_code
        ).first()

        shares_holding = holdings.quantity if holdings else 0
        total_value = shares_holding * Decimal(current_price)

        # Add calculated values to the response
        chart_data["shares_holding"] = shares_holding
        chart_data["total_value"] = total_value
        
        return jsonify(chart_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
