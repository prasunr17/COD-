"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";

interface Asset {
  id: string;
  symbol: string;
  quantity: number;
  avg_cost: number;
  current_price?: number;
  tags?: string;
}

export default function PortfolioPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    quantity: "",
    avg_cost: "",
    tags: "",
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/v1/portfolio");
      setAssets(response.data.assets || []);
    } catch (err) {
      setError("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.symbol || !formData.quantity || !formData.avg_cost) {
      setError("All fields are required");
      return;
    }

    try {
      await apiClient.post("/api/v1/portfolio/add-asset", {
        symbol: formData.symbol.toUpperCase(),
        quantity: parseFloat(formData.quantity),
        avg_cost: parseFloat(formData.avg_cost),
        tags: formData.tags,
      });

      setFormData({ symbol: "", quantity: "", avg_cost: "", tags: "" });
      setShowForm(false);
      fetchAssets();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add asset");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
          <p className="text-muted-foreground">Manage your crypto assets</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Add Asset"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add Asset Form */}
      {showForm && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Asset</h3>
          <form onSubmit={handleAddAsset} className="grid grid-cols-2 gap-4">
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
              placeholder="Quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              step="0.0001"
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Avg Cost"
              value={formData.avg_cost}
              onChange={(e) =>
                setFormData({ ...formData, avg_cost: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="col-span-2 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90"
            >
              Add Asset
            </button>
          </form>
        </div>
      )}

      {/* Assets Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {assets.length > 0 ? (
          <table className="w-full">
            <thead className="bg-background border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Avg Cost
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b hover:bg-background">
                  <td className="px-6 py-4 font-medium">{asset.symbol}</td>
                  <td className="px-6 py-4">{asset.quantity.toFixed(4)}</td>
                  <td className="px-6 py-4">${asset.avg_cost.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    ${(asset.quantity * asset.avg_cost).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {asset.tags || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <p className="mb-4">No assets in your portfolio yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-primary font-medium hover:underline"
            >
              Add your first asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
