import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://cod_user:secure_password@localhost:5432/cod_mvp")

# Redis
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Security
SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"

# External APIs
COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY", "free")
BINANCE_API_KEY = os.getenv("BINANCE_API_KEY", "")
BINANCE_API_SECRET = os.getenv("BINANCE_API_SECRET", "")

# Blockchain
TRON_RPC_URL = "https://api.shasta.trongrid.io"  # Testnet
ETHEREUM_RPC_URL = os.getenv("ETHEREUM_RPC_URL", "")

# Monitoring
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
