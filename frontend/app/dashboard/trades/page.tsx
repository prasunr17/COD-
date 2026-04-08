"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";

interface Trade {
  id: string;
  symbol: string;
  entry_price: number;
  exit_price?: number;
  quantity: number;
  status: string;
  pnl?: number;
  pnl_percentage?: number;
  notes?: string;
  created_at: string;
}

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    entry_price: "",
    exit_price: "",
    quantity: "",
    notes: "",
  });

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const [tradesRes, statsRes] = await Promise.all([
        apiClient.get("/api/v1/trades"),
        apiClient.get("/api/v1/trades/stats"),
      ]);
      setTrades(tradesRes.data.trades || []);
      setStats(statsRes.data);
    } catch (err) {
      setError("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.symbol || !formData.entry_price || !formData.quantity) {
      setError("Symbol, entry price, and quantity are required");
      return;
    }

    try {
      await apiClient.post("/api/v1/trades/add", {
        symbol: formData.symbol.toUpperCase(),
        entry_price: parseFloat(formData.entry_price),
        exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
        quantity: parseFloat(formData.quantity),
        notes: formData.notes,
      });

      setFormData({
        symbol: "",
        entry_price: "",
        exit_price: "",
        quantity: "",
        notes: "",
      });
      setShowForm(false);
      fetchTrades();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add trade");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trading Journal</h1>
          <p className="text-muted-foreground">Track and analyze your trades</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Record Trade"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="text-2xl font-bold">{stats.total_trades}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {(stats.win_rate * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p
              className={`text-2xl font-bold ${
                stats.total_pnl >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${stats.total_pnl.toFixed(2)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Avg R:R</p>
            <p className="text-2xl font-bold">{stats.avg_rr.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Add Trade Form */}
      {showForm && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Record a Trade</h3>
          <form onSubmit={handleAddTrade} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Symbol (e.g., BTC)"
                value={formData.symbol}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Entry Price"
                value={formData.entry_price}
                onChange={(e) =>
                  setFormData({ ...formData, entry_price: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Exit Price (optional)"
                value={formData.exit_price}
                onChange={(e) =>
                  setFormData({ ...formData, exit_price: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                step="0.0001"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <textarea
              placeholder="Trade notes (optional)"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90"
            >
              Record Trade
            </button>
          </form>
        </div>
      )}

      {/* Trades Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {trades.length > 0 ? (
          <table className="w-full">
            <thead className="bg-background border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Entry
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Exit
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b hover:bg-background">
                  <td className="px-6 py-4 font-medium">{trade.symbol}</td>
                  <td className="px-6 py-4">${trade.entry_price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-6 py-4">{trade.quantity.toFixed(4)}</td>
                  <td className="px-6 py-4">
                    {trade.pnl ? (
                      <span
                        className={`font-medium ${
                          trade.pnl >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${trade.pnl.toFixed(2)}
                        {trade.pnl_percentage && (
                          <span className="text-xs ml-1">
                            ({trade.pnl_percentage.toFixed(2)}%)
                          </span>
                        )}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.status === "closed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <p className="mb-4">No trades recorded yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-primary font-medium hover:underline"
            >
              Record your first trade
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
