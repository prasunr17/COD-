"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  recipient_address: string;
  status: string;
  payment_link_id?: string;
  tx_hash?: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USDT",
    recipient_address: "",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/v1/payments/list");
      setPayments(response.data.payments || []);
    } catch (err) {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.recipient_address) {
      setError("Amount and recipient address are required");
      return;
    }

    try {
      const response = await apiClient.post("/api/v1/payments/create", {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        recipient_address: formData.recipient_address,
      });

      setGeneratedLink(response.data.payment_link);
      setFormData({ amount: "", currency: "USDT", recipient_address: "" });
      fetchPayments();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create payment link");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payments 💰</h1>
          <p className="text-muted-foreground">
            Create and manage non-custodial payment links
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
        >
          {showForm ? "Cancel" : "+ Create Link"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Generated Link Display */}
      {generatedLink && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-3">Payment Link Created ✓</h3>
          <div className="bg-white p-3 rounded border border-green-200 mb-3 break-all">
            <code className="text-sm text-gray-700">{generatedLink}</code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                alert("Link copied to clipboard!");
              }}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Copy Link
            </button>
            <button
              onClick={() => setGeneratedLink(null)}
              className="px-4 py-2 text-sm border rounded hover:bg-background"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create Payment Form */}
      {showForm && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Create Payment Link</h3>
          <form onSubmit={handleCreatePaymentLink} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                step="0.01"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="USDT">USDT (Tron)</option>
                <option value="ETH">Ethereum</option>
                <option value="BTC">Bitcoin</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Recipient address"
              value={formData.recipient_address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recipient_address: e.target.value,
                })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90"
            >
              Generate Link
            </button>
          </form>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Payment History</h3>
        <div className="bg-card border rounded-lg overflow-hidden">
          {payments.length > 0 ? (
            <table className="w-full">
              <thead className="bg-background border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Recipient
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    TX Hash
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-background">
                    <td className="px-6 py-4 font-medium">
                      {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">{payment.currency}</td>
                    <td className="px-6 py-4 text-sm truncate max-w-xs">
                      {payment.recipient_address}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {payment.tx_hash ? (
                        <a
                          href={`https://tronscan.org/#/transaction/${payment.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate max-w-xs block"
                        >
                          {payment.tx_hash.substring(0, 16)}...
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p className="mb-4">No payments yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-primary font-medium hover:underline"
              >
                Create your first payment link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
