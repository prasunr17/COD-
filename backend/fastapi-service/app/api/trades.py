from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import logging
from uuid import uuid4

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock data storage (replace with DB)
trades_db: dict = {}
user_trades: dict = {}  # user_id -> [trade_ids]

# Pydantic models
class TradeCreate(BaseModel):
    asset: str
    entry_price: float
    exit_price: Optional[float] = None
    quantity: float
    trade_type: str  # "long" or "short"
    notes: Optional[str] = None
    strategy: Optional[str] = None
    emotion: Optional[str] = None

class TradeResponse(BaseModel):
    id: str
    user_id: str
    asset: str
    entry_price: float
    exit_price: Optional[float] = None
    quantity: float
    trade_type: str
    pnl: Optional[float] = None
    pnl_percent: Optional[float] = None
    status: str
    notes: Optional[str] = None
    strategy: Optional[str] = None
    emotion: Optional[str] = None
    created_at: str
    closed_at: Optional[str] = None

def calculate_pnl(entry: float, exit_price: Optional[float], qty: float, trade_type: str) -> tuple:
    """Calculate P&L and P&L percentage."""
    if exit_price is None:
        return None, None
    
    if trade_type == "long":
        pnl = (exit_price - entry) * qty
    else:  # short
        pnl = (entry - exit_price) * qty
    
    pnl_percent = ((exit_price - entry) / entry * 100) if trade_type == "long" else ((entry - exit_price) / entry * 100)
    
    return pnl, pnl_percent

# Endpoints

@router.post("/add")
async def add_trade(trade: TradeCreate, user_id: str = Query(...)):
    """
    Add a new trade to the journal.
    
    Args:
        trade: Trade entry data
        user_id: User ID (from auth token)
    
    Returns:
        Created trade object
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Adding trade for user {user_id}")
    
    trade_id = str(uuid4())
    pnl, pnl_percent = calculate_pnl(trade.entry_price, trade.exit_price, trade.quantity, trade.trade_type)
    
    trade_obj = {
        "id": trade_id,
        "user_id": user_id,
        "asset": trade.asset.upper(),
        "entry_price": trade.entry_price,
        "exit_price": trade.exit_price,
        "quantity": trade.quantity,
        "trade_type": trade.trade_type,
        "pnl": pnl,
        "pnl_percent": pnl_percent,
        "status": "open" if not trade.exit_price else "closed",
        "notes": trade.notes,
        "strategy": trade.strategy,
        "emotion": trade.emotion,
        "created_at": datetime.utcnow().isoformat(),
        "closed_at": datetime.utcnow().isoformat() if trade.exit_price else None
    }
    
    trades_db[trade_id] = trade_obj
    
    if user_id not in user_trades:
        user_trades[user_id] = []
    user_trades[user_id].append(trade_id)
    
    return trade_obj

@router.get("/")
async def get_trades(user_id: str = Query(...), limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    """
    Get all trades for a user with pagination.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Fetching trades for user {user_id}")
    
    user_trade_ids = user_trades.get(user_id, [])
    trades = [trades_db[tid] for tid in user_trade_ids if tid in trades_db]
    
    # Sort by created_at descending
    trades = sorted(trades, key=lambda x: x["created_at"], reverse=True)
    
    paginated = trades[offset:offset + limit]
    
    return {
        "trades": paginated,
        "total": len(trades),
        "pagination": {
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < len(trades)
        }
    }

@router.get("/stats")
async def get_trade_stats(user_id: str = Query(...)):
    """
    Get trading statistics and AI feedback.
    
    Returns:
        Win rate, R:R, discipline score, pattern analysis
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Calculating trade stats for user {user_id}")
    
    user_trade_ids = user_trades.get(user_id, [])
    trades = [trades_db[tid] for tid in user_trade_ids if tid in trades_db]
    
    closed_trades = [t for t in trades if t["status"] == "closed"]
    
    if not closed_trades:
        return {
            "user_id": user_id,
            "total_trades": len(trades),
            "closed_trades": 0,
            "message": "No closed trades yet. Start trading to see statistics!"
        }
    
    wins = [t for t in closed_trades if t["pnl"] and t["pnl"] > 0]
    losses = [t for t in closed_trades if t["pnl"] and t["pnl"] < 0]
    
    win_rate = len(wins) / len(closed_trades) if closed_trades else 0
    avg_win = sum(t["pnl"] for t in wins) / len(wins) if wins else 0
    avg_loss = sum(t["pnl"] for t in losses) / len(losses) if losses else 0
    
    profit_factor = abs(avg_win / avg_loss) if avg_loss != 0 else 0
    
    # Risk reward ratio calculation
    avg_risk = abs(avg_loss)
    rrr = avg_win / avg_risk if avg_risk > 0 else 0
    
    # Discipline score (0-100)
    discipline_score = min(100, int(win_rate * 100 + (rrr / 3 * 50)))
    
    return {
        "user_id": user_id,
        "total_trades": len(closed_trades),
        "open_trades": len([t for t in trades if t["status"] == "open"]),
        "win_rate": round(win_rate, 3),
        "wins": len(wins),
        "losses": len(losses),
        "avg_win": round(avg_win, 2),
        "avg_loss": round(avg_loss, 2),
        "profit_factor": round(profit_factor, 2),
        "risk_reward_ratio": round(rrr, 2),
        "discipline_score": discipline_score,
        "ai_feedback": {
            "patterns": [
                "Long trades more profitable than shorts" if len([t for t in wins if t["trade_type"] == "long"]) > len([t for t in wins if t["trade_type"] == "short"]) else "Short trades performing well",
                f"Best strategy: {max(set(t.get('strategy', 'untagged') for t in closed_trades), key=lambda x: sum(1 for t in closed_trades if t.get('strategy') == x and t['pnl'] > 0), default='N/A')}",
            ],
            "mistakes": [
                "High variance in position sizing detected" if len(set(t["quantity"] for t in trades)) > 5 else "Consistent position sizing",
                f"Emotional trading detected: {len([t for t in trades if t.get('emotion') in ['fear', 'greed']])} trades"
            ],
            "recommendation": "Focus on risk management. Keep risk per trade under 2% of capital."
        },
        "best_trade": max(closed_trades, key=lambda x: x.get("pnl", 0), default=None),
        "worst_trade": min(closed_trades, key=lambda x: x.get("pnl", 0), default=None)
    }

@router.get("/{trade_id}")
async def get_trade(trade_id: str, user_id: str = Query(...)):
    """
    Get a specific trade.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Fetching trade {trade_id}")
    
    if trade_id not in trades_db:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    trade = trades_db[trade_id]
    
    if trade["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return trade

@router.put("/{trade_id}")
async def update_trade(trade_id: str, trade: TradeCreate, user_id: str = Query(...)):
    """
    Update a trade (add exit, update notes, etc).
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Updating trade {trade_id}")
    
    if trade_id not in trades_db:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    existing_trade = trades_db[trade_id]
    
    if existing_trade["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Update fields
    existing_trade["exit_price"] = trade.exit_price
    existing_trade["notes"] = trade.notes
    existing_trade["strategy"] = trade.strategy
    existing_trade["emotion"] = trade.emotion
    
    # Recalculate P&L
    pnl, pnl_percent = calculate_pnl(existing_trade["entry_price"], trade.exit_price, existing_trade["quantity"], existing_trade["trade_type"])
    existing_trade["pnl"] = pnl
    existing_trade["pnl_percent"] = pnl_percent
    existing_trade["status"] = "open" if not trade.exit_price else "closed"
    existing_trade["closed_at"] = datetime.utcnow().isoformat() if trade.exit_price else None
    
    return {"message": "Trade updated", "trade_id": trade_id, "trade": existing_trade}

@router.delete("/{trade_id}")
async def delete_trade(trade_id: str, user_id: str = Query(...)):
    """
    Delete a trade.
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    logger.info(f"Deleting trade {trade_id}")
    
    if trade_id not in trades_db:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    trade = trades_db[trade_id]
    
    if trade["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    del trades_db[trade_id]
    user_trades[user_id].remove(trade_id)
    
    return {"message": "Trade deleted", "trade_id": trade_id}
