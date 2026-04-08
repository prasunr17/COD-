from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging
from uuid import uuid4

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock data storage (replace with DB)
portfolio_db: dict = {}  # user_id -> {asset_id -> asset_data}

# Mock price data
PRICE_DATA = {
    "BTC": 43000,
    "ETH": 2150,
    "USDT": 1.0,
    "SOL": 185,
    "XRP": 0.55,
    "ADA": 0.98,
    "DOGE": 0.12,
    "MATIC": 0.95,
}

# Pydantic models
class PortfolioAssetAdd(BaseModel):
    symbol: str
    quantity: float
    avg_cost: float
    tags: Optional[List[str]] = None

class PortfolioAssetResponse(PortfolioAssetAdd):
    id: str
    current_price: float
    current_value: float
    pnl: float
    pnl_percent: float

def get_current_price(symbol: str) -> float:
    """Get current price for asset (mock data)."""
    return PRICE_DATA.get(symbol.upper(), 0)

def calculate_pnl(quantity: float, avg_cost: float, current_price: float) -> tuple:
    """Calculate P&L and P&L percentage."""
    pnl = (current_price - avg_cost) * quantity
    pnl_percent = ((current_price - avg_cost) / avg_cost * 100) if avg_cost > 0 else 0
    return pnl, pnl_percent

# Endpoints

@router.post("/add-asset")
async def add_asset(asset: PortfolioAssetAdd, user_id: str = Query(...)):
    """
    Add an asset to portfolio (manual entry).
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Adding asset {asset.symbol} for user {user_id}")
    
    asset_id = str(uuid4())
    symbol = asset.symbol.upper()
    current_price = get_current_price(symbol)
    current_value = asset.quantity * current_price
    pnl, pnl_percent = calculate_pnl(asset.quantity, asset.avg_cost, current_price)
    
    asset_obj = {
        "id": asset_id,
        "symbol": symbol,
        "quantity": asset.quantity,
        "avg_cost": asset.avg_cost,
        "current_price": current_price,
        "current_value": current_value,
        "pnl": pnl,
        "pnl_percent": pnl_percent,
        "tags": asset.tags or [],
        "created_at": datetime.utcnow().isoformat()
    }
    
    if user_id not in portfolio_db:
        portfolio_db[user_id] = {}
    
    portfolio_db[user_id][asset_id] = asset_obj
    
    return asset_obj

@router.get("/")
async def get_portfolio(user_id: str = Query(...)):
    """
    Get user's entire portfolio with real-time prices.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Fetching portfolio for user {user_id}")
    
    user_assets = portfolio_db.get(user_id, {})
    
    # Recalculate current prices and P&L
    assets = []
    total_value = 0
    total_invested = 0
    
    for asset_id, asset in user_assets.items():
        current_price = get_current_price(asset["symbol"])
        current_value = asset["quantity"] * current_price
        pnl, pnl_percent = calculate_pnl(asset["quantity"], asset["avg_cost"], current_price)
        invested = asset["quantity"] * asset["avg_cost"]
        
        assets.append({
            "id": asset_id,
            "symbol": asset["symbol"],
            "quantity": asset["quantity"],
            "avg_cost": asset["avg_cost"],
            "current_price": current_price,
            "current_value": current_value,
            "pnl": pnl,
            "pnl_percent": round(pnl_percent, 2),
            "allocation": 0  # Will calculate below
        })
        
        total_value += current_value
        total_invested += invested
    
    # Calculate allocation percentages
    for asset in assets:
        asset["allocation"] = round((asset["current_value"] / total_value * 100), 1) if total_value > 0 else 0
    
    # Sort by allocation descending
    assets = sorted(assets, key=lambda x: x["allocation"], reverse=True)
    
    total_pnl = total_value - total_invested
    total_pnl_percent = ((total_value - total_invested) / total_invested * 100) if total_invested > 0 else 0
    
    return {
        "user_id": user_id,
        "assets": assets,
        "summary": {
            "total_value": round(total_value, 2),
            "total_invested": round(total_invested, 2),
            "total_pnl": round(total_pnl, 2),
            "total_pnl_percent": round(total_pnl_percent, 2),
            "allocation": {asset["symbol"]: asset["allocation"] for asset in assets}
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/summary")
async def get_portfolio_summary(user_id: str = Query(...)):
    """
    Get portfolio summary (allocation, PnL, top performers).
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Fetching portfolio summary for user {user_id}")
    
    user_assets = portfolio_db.get(user_id, {})
    
    if not user_assets:
        return {
            "message": "No assets in portfolio yet. Start by adding an asset!",
            "total_value": 0,
            "total_invested": 0,
            "total_pnl": 0
        }
    
    assets_with_pnl = []
    total_value = 0
    total_invested = 0
    
    for asset_id, asset in user_assets.items():
        current_price = get_current_price(asset["symbol"])
        current_value = asset["quantity"] * current_price
        pnl, pnl_percent = calculate_pnl(asset["quantity"], asset["avg_cost"], current_price)
        invested = asset["quantity"] * asset["avg_cost"]
        
        assets_with_pnl.append({
            "symbol": asset["symbol"],
            "pnl": pnl,
            "pnl_percent": pnl_percent,
            "current_value": current_value
        })
        
        total_value += current_value
        total_invested += invested
    
    total_pnl = total_value - total_invested
    
    top_performer = max(assets_with_pnl, key=lambda x: x["pnl_percent"], default=None)
    worst_performer = min(assets_with_pnl, key=lambda x: x["pnl_percent"], default=None)
    
    allocation = {asset["symbol"]: round((asset["current_value"] / total_value * 100), 1) for asset in assets_with_pnl if total_value > 0}
    
    return {
        "total_value": round(total_value, 2),
        "total_invested": round(total_invested, 2),
        "total_pnl": round(total_pnl, 2),
        "total_pnl_percent": round(((total_pnl / total_invested * 100) if total_invested > 0 else 0), 2),
        "allocation": allocation,
        "top_performer": {
            "symbol": top_performer["symbol"],
            "pnl_percent": round(top_performer["pnl_percent"], 2),
            "pnl": round(top_performer["pnl"], 2)
        } if top_performer else None,
        "worst_performer": {
            "symbol": worst_performer["symbol"],
            "pnl_percent": round(worst_performer["pnl_percent"], 2),
            "pnl": round(worst_performer["pnl"], 2)
        } if worst_performer else None,
        "asset_count": len(assets_with_pnl)
    }

@router.put("/asset/{asset_id}")
async def update_asset(asset_id: str, asset: PortfolioAssetAdd, user_id: str = Query(...)):
    """
    Update an asset (quantity, avg_cost, tags).
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Updating asset {asset_id}")
    
    if user_id not in portfolio_db or asset_id not in portfolio_db[user_id]:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    existing_asset = portfolio_db[user_id][asset_id]
    
    # Update fields
    existing_asset["symbol"] = asset.symbol.upper()
    existing_asset["quantity"] = asset.quantity
    existing_asset["avg_cost"] = asset.avg_cost
    existing_asset["tags"] = asset.tags or []
    
    # Recalculate
    current_price = get_current_price(existing_asset["symbol"])
    existing_asset["current_price"] = current_price
    existing_asset["current_value"] = asset.quantity * current_price
    existing_asset["pnl"], existing_asset["pnl_percent"] = calculate_pnl(asset.quantity, asset.avg_cost, current_price)
    
    return {"message": "Asset updated", "asset_id": asset_id, "asset": existing_asset}

@router.delete("/asset/{asset_id}")
async def delete_asset(asset_id: str, user_id: str = Query(...)):
    """
    Remove an asset from portfolio.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Deleting asset {asset_id}")
    
    if user_id not in portfolio_db or asset_id not in portfolio_db[user_id]:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    del portfolio_db[user_id][asset_id]
    
    return {"message": "Asset deleted", "asset_id": asset_id}
