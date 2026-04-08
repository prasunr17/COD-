from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging
from contextlib import asynccontextmanager

# Import routers
from app.api import insights, trades, portfolio

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("FastAPI service starting...")
    yield
    # Shutdown
    logger.info("FastAPI service shutting down...")

# Create FastAPI app
app = FastAPI(
    title="COD MVP - FastAPI Service",
    description="AI Insights + Trading Journal + Portfolio Analytics",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add prod domains later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security: Trusted Host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.example.com"]  # Update with prod domains
)

# Include routers
app.include_router(insights.router, prefix="/api/v1/insights", tags=["Insights"])
app.include_router(trades.router, prefix="/api/v1/trades", tags=["Trades"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["Portfolio"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "COD MVP - FastAPI",
        "version": "0.1.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to COD MVP - FastAPI Service",
        "docs": "/docs",
        "version": "0.1.0"
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code,
        "path": request.url.path
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
