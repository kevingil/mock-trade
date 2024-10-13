import yfinance as yf

from pydantic import BaseModel
from typing import List
from flask import Blueprint, request
from app.models.schema import HoldingSchema
from app.controllers import openai_client

from pydantic import BaseModel
from typing import Optional

class StockData(BaseModel):
    # Basic Info
    symbol: str
    shortName: str
    industry: str
    sector: str

    # Key Financial Metrics
    marketCap: float
    trailingPE: Optional[float]
    forwardPE: Optional[float]
    priceToBook: float
    profitMargins: float
    revenueGrowth: float
    returnOnEquity: float

    # Market Data
    currentPrice: float
    fiftyTwoWeekLow: float
    fiftyTwoWeekHigh: float
    fiftyDayAverage: float
    twoHundredDayAverage: float

    # Analyst Opinions
    recommendationMean: float
    recommendationKey: str
    numberOfAnalystOpinions: int

    # Volume and Volatility
    averageVolume: int
    beta: float

    # Additional Metrics
    dividendYield: Optional[float]
    debtToEquity: float

class BulletPoints(BaseModel):
    answer1: str
    answer2: str
    answer3: List[str]

class CompletionResponse(BaseModel):
    answers: BulletPoints
    summary: str

completions = Blueprint("completions", __name__)

@completions.route("/stock-advice", methods=["GET"])
def get_stock_advice():
    user_id = request.args.get("userId")
    holdings = HoldingSchema.query.filter_by(user_id=user_id).all() or []
    
    # Get stock data from yfinance
    processed_holdings = []
    
    for holding in holdings:
        ticker = yf.Ticker(holding.ticker)  # Fetch each ticker's data individually
        processed_holdings.append(
            StockData(
                symbol=holding.ticker,
                shortName=ticker.info.get("shortName"),
                industry=ticker.info.get("industry"),
                sector=ticker.info.get("sector"),
                marketCap=ticker.info.get("marketCap"),
                trailingPE=ticker.info.get("trailingPE"),
                forwardPE=ticker.info.get("forwardPE"),
                priceToBook=ticker.info.get("priceToBook"),
                profitMargins=ticker.info.get("profitMargins"),
                revenueGrowth=ticker.info.get("revenueGrowth"),
                returnOnEquity=ticker.info.get("returnOnEquity"),
                currentPrice=ticker.info.get("currentPrice"),
                fiftyTwoWeekLow=ticker.info.get("fiftyTwoWeekLow"),
                fiftyTwoWeekHigh=ticker.info.get("fiftyTwoWeekHigh"),
                fiftyDayAverage=ticker.info.get("fiftyDayAverage"),
                twoHundredDayAverage=ticker.info.get("twoHundredDayAverage"),
                recommendationMean=ticker.info.get("recommendationMean"),
                recommendationKey=ticker.info.get("recommendationKey"),
                numberOfAnalystOpinions=ticker.info.get("numberOfAnalystOpinions"),
                averageVolume=ticker.info.get("averageVolume"),
                beta=ticker.info.get("beta"),
                dividendYield=ticker.info.get("dividendYield"),
                debtToEquity=ticker.info.get("debtToEquity"),
            )
        )
    
    print(processed_holdings)
    completion = openai_client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[
            {"role": "system", "content": "You're a helpful financial assistant, \n" +
                                        "help me make an informed decision based on my portfolio. \n" +
                                        "Question1: What is good about my portfolio?\n" +
                                        "Question2: What can be improved about my portfolio?\n" +
                                        "Question3: Recommend 6 stock tickers to buy\n" +
                                        "Review your work and remove all markdown syntax, respond with plain text only. Keep responses brief and short\n"},

            {"role": "user", "content": "Here's my stock portfolio: " + str(processed_holdings) + " What's your advice?"},
        ],
        response_format=CompletionResponse,
    )

    message = completion.choices[0].message
    if message.parsed:
        return message.parsed.json(), 200
    else:
        print(message.refusal)
        return {"error": message.refusal}
        
        
