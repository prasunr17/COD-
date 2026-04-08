"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";

interface PortfolioSummary {
  total_value: number;
  buy_value: number;
  unrealized_pnl: number;
  pnl_percentage: number;
  asset_count: number;
}

interface InsightCard {
  asset: string;
  sentiment_score: number;
  trend: string;
  confidence: number;
}

interface TradeStats {
  total_trades: number;
  winning_trades: number;
  win_rate: number;
  avg_pnl: number;
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch portfolio summary
        const portfolioRes = await apiClient.get("/api/v1/portfolio");
        setPortfolio(portfolioRes.data);

        // Fetch insights
        const insightsRes = await apiClient.get("/api/v1/insights/assets");
        setInsights(insightsRes.data.slice(0, 3)); // Show top 3

        // Fetch trade stats
        const statsRes = await apiClient.get("/api/v1/trades/stats");
        setStats(statsRes.data);
      } catch (err: any) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your crypto portfolio overview.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Portfolio Summary Cards */}
      {portfolio && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Value */}
          <div className="bg-card border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Value</p>
            <p className="text-2xl font-bold">
              ${portfolio.total_value.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {portfolio.asset_count} assets
            </p>
          </div>

          {/* Buy Value */}
          <div className="bg-card border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Invested</p>
            <p className="text-2xl font-bold">
              ${portfolio.buy_value.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Initial buy-in</p>
          </div>

          {/* P&L */}
          <div className="bg-card border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">
              Unrealized P&L
            </p>
            <p
              className={`text-2xl font-bold ${
                portfolio.unrealized_pnl >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${portfolio.unrealized_pnl.toFixed(2)}
            </p>
            <p
              className={`text-xs mt-2 ${
                portfolio.pnl_percentage >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {portfolio.pnl_percentage >= 0 ? "+" : ""}
              {portfolio.pnl_percentage.toFixed(2)}%
            </p>
          </div>

          {/* Assets */}
          <div className="bg-card border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Portfolio Health</p>
            <p className="text-2xl font-bold">Good</p>
            <p className="text-xs text-muted-foreground mt-2">3% diversified</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Insights */}
        <div className="lg:col-span-2 bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Insights 🤖</h3>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.asset}
                  className="flex items-center justify-between p-4 bg-background rounded border"
                >
                  <div>
                    <p className="font-medium">{insight.asset}</p>
                    <p className="text-sm text-muted-foreground">
                      Trend: {insight.trend}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        insight.sentiment_score > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(insight.sentiment_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(insight.confidence * 100).toFixed(0)}% confident
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No insights available yet
            </p>
          )}
        </div>

        {/* Trading Stats */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Trading Stats 📈</h3>
          {stats ? (
            <div className="space-y-4">
              <div className="p-3 bg-background rounded border">
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold">{stats.total_trades}</p>
              </div>
              <div className="p-3 bg-background rounded border">
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {(stats.win_rate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-background rounded border">
                <p className="text-sm text-muted-foreground">Avg P&L</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.avg_pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${stats.avg_pnl.toFixed(2)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No trading data
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/dashboard/portfolio"
          className="bg-primary text-primary-foreground px-4 py-3 rounded-lg text-center font-medium hover:opacity-90 transition"
        >
          📊 View Portfolio
        </a>
        <a
          href="/dashboard/trades"
          className="bg-primary text-primary-foreground px-4 py-3 rounded-lg text-center font-medium hover:opacity-90 transition"
        >
          📈 Record Trade
        </a>
        <a
          href="/dashboard/payments"
          className="bg-primary text-primary-foreground px-4 py-3 rounded-lg text-center font-medium hover:opacity-90 transition"
        >
          💰 Payment Link
        </a>
      </div>
    </div>
  );
}
