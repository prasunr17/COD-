from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict
from datetime import datetime
import logging
import random

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock data storage (replace with DB queries)
TRACKED_ASSETS = ["BTC", "ETH", "USDT", "SOL", "XRP", "ADA", "DOGE", "MATIC"]
ASSET_DATA = {
    "BTC": {"price": 43000, "change_24h": 2.1, "vol": 25.2},
    "ETH": {"price": 2150, "change_24h": 1.8, "vol": 18.5},
    "USDT": {"price": 1.0, "change_24h": 0.0, "vol": 5.2},
    "SOL": {"price": 185, "change_24h": 12.5, "vol": 35.0},
    "XRP": {"price": 0.55, "change_24h": 8.3, "vol": 28.0},
    "ADA": {"price": 0.98, "change_24h": -2.1, "vol": 10.0},
    "DOGE": {"price": 0.12, "change_24h": -4.2, "vol": 15.0},
    "MATIC": {"price": 0.95, "change_24h": 3.5, "vol": 12.0},
}

def calculate_sentiment(change_24h: float) -> Dict:
    """Calculate sentiment based on price change."""
    if change_24h > 5:
        trend = "bullish"
        sentiment_score = 0.7 + (change_24h / 100)
    elif change_24h < -5:
        trend = "bearish"
        sentiment_score = 0.3 - (abs(change_24h) / 100)
    else:
        trend = "neutral"
        sentiment_score = 0.5
    
    confidence = min(0.95, 0.6 + abs(change_24h) / 100)
    return {
        "sentiment_score": min(0.99, max(0.01, sentiment_score)),
        "trend": trend,
        "confidence": confidence
    }

# Endpoints

@router.get("/assets")
async def get_insights_assets():
    """
    Get insights for all tracked assets.
    Returns sentiment scores, trend, and confidence levels.
    """
    logger.info("Fetching insights for all assets")
    
    assets = []
    for symbol in TRACKED_ASSETS:
        if symbol in ASSET_DATA:
            data = ASSET_DATA[symbol]
            sentiment = calculate_sentiment(data["change_24h"])
            assets.append({
                "symbol": symbol,
                "price": data["price"],
                "change_24h": data["change_24h"],
                **sentiment,
                "timestamp": datetime.utcnow().isoformat()
            })
    
    return {
        "assets": assets,
        "count": len(assets),
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/{asset}")
async def get_asset_insights(asset: str):
    """
    Get insights for a specific asset.
    
    Args:
        asset: Symbol (e.g., BTC, USDT)
    
    Returns:
        Sentiment, trend, volatility, and confidence
    """
    asset = asset.upper()
    logger.info(f"Fetching insights for asset: {asset}")
    
    if not asset or asset not in ASSET_DATA:
        raise HTTPException(status_code=404, detail=f"Asset {asset} not found or not tracked")
    
    data = ASSET_DATA[asset]
    sentiment = calculate_sentiment(data["change_24h"])
    
    return {
        "asset": asset,
        "price": data["price"],
        "change_24h": data["change_24h"],
        "volatility": data["vol"],
        **sentiment,
        "data_sources": ["price_action", "volume", "momentum"],
        "technical": {
            "rsi": random.uniform(30, 70),
            "macd": "positive" if data["change_24h"] > 0 else "negative",
            "support": data["price"] * 0.95,
            "resistance": data["price"] * 1.05
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/sentiment/top-movers")
async def get_top_movers(limit: int = Query(10, ge=1, le=50)):
    """
    Get top gainers and losers across tracked assets.
    """
    logger.info(f"Fetching top {limit} movers")
    
    assets_with_change = [
        (symbol, ASSET_DATA[symbol]["change_24h"])
        for symbol in TRACKED_ASSETS
        if symbol in ASSET_DATA
    ]
    
    sorted_assets = sorted(assets_with_change, key=lambda x: x[1], reverse=True)
    
    gainers = sorted_assets[:limit//2]
    losers = sorted_assets[-(limit//2):]
    
    gainers_list = [
        {
            "symbol": symbol,
            "change_24h": change,
            "price": ASSET_DATA[symbol]["price"],
            **calculate_sentiment(change)
        }
        for symbol, change in gainers
    ]
    
    losers_list = [
        {
            "symbol": symbol,
            "change_24h": change,
            "price": ASSET_DATA[symbol]["price"],
            **calculate_sentiment(change)
        }
        for symbol, change in reversed(losers)
    ]
    
    return {
        "gainers": gainers_list,
        "losers": losers_list,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/whale-activity")
async def get_whale_activity():
    """
    Get whale transaction alerts (on-chain data).
    Premium feature.
    """
    logger.info("Fetching whale activity")
    
    # Mock whale data
    whale_moves = [
        {
            "asset": "BTC",
            "amount": 25.5,
            "usd_value": 25.5 * 43000,
            "from": "0x742d35Cc6634C0532925a3b844Bc0e7595f8....",
            "to": "0x1234567890abcdef1234567890abcdef1234....",
            "tx_hash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abc",
            "timestamp": datetime.utcnow().isoformat(),
            "type": "whale_transfer"
        },
        {
            "asset": "ETH",
            "amount": 500,
            "usd_value": 500 * 2150,
            "from": "0x0000000000000000000000000000000000000000",
            "to": "0xkraken_deposit_address_example123456789",
            "tx_hash": "0xdef1234567890abcdef1234567890abcdef12345678901234abc",
            "timestamp": datetime.utcnow().isoformat(),
            "type": "exchange_deposit"
        }
    ]
    
    return {
        "whale_moves": whale_moves,
        "significance": "high",
        "alert_level": "premium",
        "interpretation": "Large whale transfer detected. Possible liquidation or accumulation signal.",
        "timestamp": datetime.utcnow().isoformat()
    }
