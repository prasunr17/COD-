"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";

interface Insight {
  id: string;
  asset: string;
  sentiment_score: number;
  trend: string;
  confidence: number;
  timestamp: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "bullish" | "bearish" | "neutral">("all");

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/v1/insights/assets");
      setInsights(response.data || []);
    } catch (err) {
      setError("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = insights.filter((insight) => {
    if (filter === "all") return true;
    return insight.trend.toLowerCase() === filter;
  });

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "bullish":
        return "text-green-600 bg-green-50";
      case "bearish":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Market Insights 🤖</h1>
        <p className="text-muted-foreground">
          AI-powered sentiment analysis and trend predictions
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {["all", "bullish", "bearish", "neutral"].map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === option
                ? "bg-primary text-primary-foreground"
                : "bg-card border hover:bg-background"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight) => (
            <div key={insight.id} className="bg-card border rounded-lg p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{insight.asset}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(insight.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getTrendColor(
                    insight.trend
                  )}`}
                >
                  {insight.trend.toUpperCase()}
                </span>
              </div>

              {/* Sentiment Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Sentiment</span>
                  <span
                    className={`text-lg font-bold ${
                      insight.sentiment_score > 0
                        ? "text-green-600"
                        : insight.sentiment_score < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {insight.sentiment_score > 0 ? "+" : ""}
                    {(insight.sentiment_score * 100).toFixed(0)}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      insight.sentiment_score > 0
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.abs(insight.sentiment_score) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Confidence */}
              <div className="p-3 bg-background rounded border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Confidence
                  </span>
                  <span className="font-semibold">
                    {(insight.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-4 px-3 py-2 text-sm border rounded-lg hover:bg-background transition">
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <p>No insights found for this filter</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Market Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Bullish Assets</p>
            <p className="text-2xl font-bold text-green-600">
              {insights.filter((i) => i.trend.toLowerCase() === "bullish").length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Bearish Assets</p>
            <p className="text-2xl font-bold text-red-600">
              {insights.filter((i) => i.trend.toLowerCase() === "bearish").length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Neutral Assets</p>
            <p className="text-2xl font-bold text-gray-600">
              {insights.filter((i) => i.trend.toLowerCase() === "neutral").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
