from flask import request, jsonify, Blueprint
import yfinance as yf
import json
import datetime
from decimal import Decimal
from app.models.schema import HoldingSchema
from . import yf_set_interval

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
    
    # Set variables
    interval = yf_set_interval(date_range)
    ticker = None
    current_price = None


    # Fetch stock data using yfinance
    try:
        ticker = yf.Ticker(ticket_code)
        stock_data = ticker.history(period=date_range, interval=interval)
        current_price = ticker.info.get("currentPrice")
        # If no historical data is available for the given date range
        if stock_data.empty:
            # If current price is available, return it as the only data point
            if current_price:
                return (
                    # Return the current price as fallback data
                    # return twice to show as line in graph
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
                raise Exception("No historical data available for the given date range")


    except Exception as e:
        return jsonify({"error": str(e)}), 500    

    # Calculate shares_holding and portfolio_percentage
    holdings = HoldingSchema.query.filter_by(
        user_id=user_id, ticker=ticket_code
    ).first()

    shares_holding = holdings.quantity if holdings else 0

    # Prepare data for charting (dates and closing prices)
    time_fmt = "%H:%M" if date_range == "1d" else "%m-%d-%Y"
    delta = stock_data["Close"].iloc[-1] - stock_data["Close"].iloc[0]
    
    chart_data = {
        "dates": stock_data.index.strftime(time_fmt).tolist(),
        "closing_prices": stock_data["Close"].tolist(),
        "name": ticker.info.get("longName", "Unknown"),
        "shares_holding": shares_holding,
        "total_value": shares_holding * Decimal(current_price),
        "delta": delta,
        "delta_percentage": (delta / current_price) * 100
    }
    
    print(chart_data["delta_percentage"])
        
    return jsonify(chart_data)


'''

ticker.info example


{
   "address1":"1600 Amphitheatre Parkway",
   "city":"Mountain View",
   "state":"CA",
   "zip":"94043",
   "country":"United States",
   "phone":"650 253 0000",
   "website":"https://abc.xyz",
   "industry":"Internet Content & Information",
   "industryKey":"internet-content-information",
   "industryDisp":"Internet Content & Information",
   "sector":"Communication Services",
   "sectorKey":"communication-services",
   "sectorDisp":"Communication Services",
   "longBusinessSummary":"Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments. The Google Services segment provides products and services, including ads, Android, Chrome, devices, Gmail, Google Drive, Google Maps, Google Photos, Google Play, Search, and YouTube. It is also involved in the sale of apps and in-app purchases and digital content in the Google Play and YouTube; and devices, as well as in the provision of YouTube consumer subscription services. The Google Cloud segment offers infrastructure, cybersecurity, databases, analytics, AI, and other services; Google Workspace that include cloud-based communication and collaboration tools for enterprises, such as Gmail, Docs, Drive, Calendar, and Meet; and other services for enterprise customers. The Other Bets segment sells healthcare-related and internet services. The company was incorporated in 1998 and is headquartered in Mountain View, California.",
   "fullTimeEmployees":179582,
   "companyOfficers":[
      {
         "maxAge":1,
         "name":"Mr. Sundar  Pichai",
         "age":50,
         "title":"CEO & Director",
         "yearBorn":1973,
         "fiscalYear":2023,
         "totalPay":8802824,
         "exercisedValue":0,
         "unexercisedValue":0
      },
      {
         "maxAge":1,
         "name":"Ms. Ruth M. Porat",
         "age":65,
         "title":"President & Chief Investment Officer",
         "yearBorn":1958,
         "fiscalYear":2023,
         "totalPay":2515700,
         "exercisedValue":0,
         "unexercisedValue":0
      },
      {
         "maxAge":1,
         "name":"Dr. Lawrence Edward Page II",
         "age":50,
         "title":"Co-Founder & Director",
         "yearBorn":1973,
         "fiscalYear":2023,
         "totalPay":1,
         "exercisedValue":0,
         "unexercisedValue":0
      },
      {
         "maxAge":1,
         "name":"Mr. Sergey  Brin",
         "age":49,
         "title":"Co-Founder & Director",
         "yearBorn":1974,
         "fiscalYear":2023,
         "totalPay":1,
         "exercisedValue":0,
         "unexercisedValue":0
      },
      {
         "maxAge":1,
         "name":"Mr. J. Kent Walker",
         "age":62,
         "title":"President of Global Affairs, Chief Legal Officer & Company Secretary",
         "yearBorn":1961,
         "fiscalYear":2023,
         "totalPay":2511737,
         "exercisedValue":0,
         "unexercisedValue":0
      },
      {
         "maxAge":1,
         "name":"Dr. Prabhakar  Raghavan",
         "age":62,
         "title":"Senior Vice President of Knowledge and Information - Google",
         "yearBorn":1961,
         "fiscalYear":2023,
         "totalPay":2511737,
         "exercisedValue":0,
         "unexercisedValue":0
      },
      {
         "maxAge":1,
         "name":"Mr. Philipp  Schindler",
         "age":52,
         "title":"Senior Vice President & Chief Business Officer of Google",
         "yearBorn":1971,
         "fiscalYear":2023,
         "totalPay":2514032,
         "exercisedValue":0,
         "unexercisedValue":0
      },
      {
         "maxAge":1,
         "name":"Ms. Anat  Ashkenazi",
         "age":50,
         "title":"Senior VP & CFO",
         "yearBorn":1973,
         "fiscalYear":2023,
         "exercisedValue":0,
         "unexercisedValue":0
      },
      {
         "maxAge":1,
         "name":"Ms. Amie Thuener O'Toole",
         "age":48,
         "title":"Chief Accounting Officer & VP",
         "yearBorn":1975,
         "fiscalYear":2023,
         "exercisedValue":0,
         "unexercisedValue":0
      },
      {
         "maxAge":1,
         "name":"Ms. Ellen  West",
         "title":"Vice President of Investor Relations",
         "fiscalYear":2023,
         "exercisedValue":0,
         "unexercisedValue":0
      }
   ],
   "auditRisk":9,
   "boardRisk":8,
   "compensationRisk":10,
   "shareHolderRightsRisk":10,
   "overallRisk":10,
   "governanceEpochDate":1727740800,
   "compensationAsOfEpochDate":1703980800,
   "maxAge":86400,
   "priceHint":2,
   "previousClose":162.98,
   "open":163.86,
   "dayLow":162.87,
   "dayHigh":164.725,
   "regularMarketPreviousClose":162.98,
   "regularMarketOpen":163.86,
   "regularMarketDayLow":162.87,
   "regularMarketDayHigh":164.725,
   "dividendRate":0.8,
   "dividendYield":0.0049,
   "exDividendDate":1725840000,
   "payoutRatio":0.0287,
   "beta":1.038,
   "trailingPE":23.583933,
   "forwardPE":18.87256,
   "volume":19840071,
   "regularMarketVolume":19840071,
   "averageVolume":25538039,
   "averageVolume10days":20639930,
   "averageDailyVolume10Day":20639930,
   "bid":164.34,
   "ask":164.4,
   "bidSize":300,
   "askSize":300,
   "marketCap":2030947794944,
   "fiftyTwoWeekLow":120.21,
   "fiftyTwoWeekHigh":191.75,
   "priceToSalesTrailing12Months":6.1865573,
   "fiftyDayAverage":161.9468,
   "twoHundredDayAverage":159.5923,
   "trailingAnnualDividendRate":0.2,
   "trailingAnnualDividendYield":0.0012271445,
   "currency":"USD",
   "enterpriseValue":1951511740416,
   "profitMargins":0.26702,
   "floatShares":10983843700,
   "sharesOutstanding":5858999808,
   "sharesShort":79576572,
   "sharesShortPriorMonth":69353838,
   "sharesShortPreviousMonthDate":1723680000,
   "dateShortInterest":1726185600,
   "sharesPercentSharesOut":0.0064999997,
   "heldPercentInsiders":0.00246,
   "heldPercentInstitutions":0.81112,
   "shortRatio":3.19,
   "shortPercentOfFloat":0.0136,
   "impliedSharesOutstanding":12355200000,
   "bookValue":24.408,
   "priceToBook":6.7346773,
   "lastFiscalYearEnd":1703980800,
   "nextFiscalYearEnd":1735603200,
   "mostRecentQuarter":1719705600,
   "earningsQuarterlyGrowth":0.286,
   "netIncomeToCommon":87656996864,
   "trailingEps":6.97,
   "forwardEps":8.71,
   "pegRatio":1.04,
   "lastSplitFactor":"20:1",
   "lastSplitDate":1658102400,
   "enterpriseToRevenue":5.945,
   "enterpriseToEbitda":16.899,
   "52WeekChange":0.16954815,
   "SandP52WeekChange":0.3139584,
   "lastDividendValue":0.2,
   "lastDividendDate":1725840000,
   "exchange":"NMS",
   "quoteType":"EQUITY",
   "symbol":"GOOGL",
   "underlyingSymbol":"GOOGL",
   "shortName":"Alphabet Inc.",
   "longName":"Alphabet Inc.",
   "firstTradeDateEpochUtc":1092922200,
   "timeZoneFullName":"America/New_York",
   "timeZoneShortName":"EDT",
   "uuid":"e15ce71f-f533-3912-9f11-a46c09e2412b",
   "messageBoardId":"finmb_29096",
   "gmtOffSetMilliseconds":-14400000,
   "currentPrice":164.38,
   "targetHighPrice":234.59,
   "targetLowPrice":170.0,
   "targetMeanPrice":201.22,
   "targetMedianPrice":200.0,
   "recommendationMean":1.9,
   "recommendationKey":"buy",
   "numberOfAnalystOpinions":49,
   "totalCash":100724998144,
   "totalCashPerShare":8.182,
   "ebitda":115478003712,
   "totalDebt":28718999552,
   "quickRatio":1.897,
   "currentRatio":2.079,
   "totalRevenue":328284012544,
   "debtToEquity":9.549,
   "revenuePerShare":26.353,
   "returnOnAssets":0.15961,
   "returnOnEquity":0.30871,
   "freeCashflow":43988500480,
   "operatingCashflow":105059000320,
   "earningsGrowth":0.314,
   "revenueGrowth":0.136,
   "grossMargins":0.57639,
   "ebitdaMargins":0.35176,
   "operatingMargins":0.32362998,
   "financialCurrency":"USD",
   "trailingPegRatio":1.0941
}


'''
