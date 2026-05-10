"use client";

import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Plus, 
  RotateCw, 
  Trash2, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Coins, 
  RefreshCw,
  Globe
} from "lucide-react";

interface LlmGatewayNode {
  id?: number;
  name: string;
  endpointUrl: string;
  providerType: string;
  modelName: string;
  active: boolean;
  status: string;
  suspendedUntil: string | null;
  successCount: number;
  failureCount: number;
  totalTokensUsed: number;
  lastRequestTime: string | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:62001";

export default function Home() {
  const [nodes, setNodes] = useState<LlmGatewayNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [providerType, setProviderType] = useState("gemini");
  const [modelName, setModelName] = useState("gemini-3-flash-preview");

  const fetchNodes = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/nodes`);
      if (res.ok) {
        const data = await res.json();
        setNodes(data);
      }
    } catch (e) {
      console.error("Failed to load gateway nodes:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNodes();
    // Poll nodes status every 10 seconds for real-time charts
    const interval = setInterval(fetchNodes, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNodes();
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: LlmGatewayNode = {
      name,
      endpointUrl,
      providerType,
      modelName,
      active: true,
      status: "HEALTHY",
      suspendedUntil: null,
      successCount: 0,
      failureCount: 0,
      totalTokensUsed: 0,
      lastRequestTime: null
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchNodes();
        setShowModal(false);
        // Reset form
        setName("");
        setEndpointUrl("");
        setProviderType("gemini");
        setModelName("gemini-3-flash-preview");
      }
    } catch (e) {
      alert("Error creating gateway node");
    }
  };

  const handleDeleteNode = async (id: number) => {
    if (!confirm("Are you sure you want to delete this gateway node?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/nodes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchNodes();
      }
    } catch (e) {
      alert("Error deleting node");
    }
  };

  const handleResetNode = async (id: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/nodes/${id}/reset`, {
        method: "POST"
      });
      if (res.ok) {
        fetchNodes();
      }
    } catch (e) {
      alert("Error resetting node");
    }
  };

  // KPI calculations
  const totalNodes = nodes.length;
  const healthyNodes = nodes.filter(n => n.status === "HEALTHY").length;
  const exhaustedNodes = nodes.filter(n => n.status === "EXHAUSTED").length;
  const downNodes = nodes.filter(n => n.status === "DOWN").length;

  const totalSuccess = nodes.reduce((sum, n) => sum + n.successCount, 0);
  const totalFailures = nodes.reduce((sum, n) => sum + n.failureCount, 0);
  const totalTokens = nodes.reduce((sum, n) => sum + n.totalTokensUsed, 0);

  const successRate = totalSuccess + totalFailures > 0 
    ? ((totalSuccess / (totalSuccess + totalFailures)) * 100).toFixed(1)
    : "100";

  return (
    <main className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>LLM Gateways Control Panel</h1>
          <p>Dynamic routing & single-key pod rate management panel</p>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            <RotateCw size={16} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Register Node
          </button>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Active Gateways</span>
            <span className="stat-value">{healthyNodes} / {totalNodes}</span>
          </div>
          <div className="stat-icon purple">
            <Cpu size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Success Rate</span>
            <span className="stat-value">{successRate}%</span>
          </div>
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Total Tokens</span>
            <span className="stat-value">{totalTokens.toLocaleString()}</span>
          </div>
          <div className="stat-icon blue">
            <Coins size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Exhausted (429)</span>
            <span className="stat-value">{exhaustedNodes}</span>
          </div>
          <div className="stat-icon red">
            <AlertTriangle size={24} />
          </div>
        </div>
      </section>

      {/* Gateway Nodes Management */}
      <section className="content-section">
        <div className="section-header">
          <h2>
            <Globe size={20} />
            Gateway Instances Pool
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
            <Activity className="spin" style={{ marginBottom: "1rem" }} />
            <p>Loading active gateways...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#64748b", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "12px" }}>
            <p style={{ marginBottom: "1.5rem", fontSize: "1.1rem" }}>No gateway nodes registered yet.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Register First Node
            </button>
          </div>
        ) : (
          <div className="nodes-table-container">
            <table className="nodes-table">
              <thead>
                <tr>
                  <th>Node Name</th>
                  <th>Provider</th>
                  <th>Model</th>
                  <th>Endpoint URL</th>
                  <th>Status</th>
                  <th>Suspension</th>
                  <th>Stats (S/F)</th>
                  <th>Tokens</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map(node => (
                  <tr key={node.id}>
                    <td style={{ fontWeight: 700, color: "white" }}>{node.name}</td>
                    <td>
                      <span className="status-badge" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                        {node.providerType}
                      </span>
                    </td>
                    <td>
                      <span className="badge-model">{node.modelName}</span>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#94a3b8" }}>
                      {node.endpointUrl}
                    </td>
                    <td>
                      <span className={`status-badge status-${node.status.toLowerCase()}`}>
                        {node.status}
                      </span>
                    </td>
                    <td>
                      {node.suspendedUntil ? (
                        <span style={{ fontSize: "0.75rem", color: "#f59e0b" }}>
                          Until {new Date(node.suspendedUntil).toLocaleTimeString()}
                        </span>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>{node.successCount}</span>
                      <span style={{ color: "#64748b" }}> / </span>
                      <span style={{ color: "#ef4444", fontWeight: 600 }}>{node.failureCount}</span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "#3b82f6" }}>
                      {node.totalTokensUsed.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        {node.status !== "HEALTHY" && (
                          <button 
                            className="btn btn-action btn-reset" 
                            title="Reset Suspension Lock"
                            onClick={() => node.id && handleResetNode(node.id)}
                          >
                            <RefreshCw size={12} />
                            Reset
                          </button>
                        )}
                        <button 
                          className="btn btn-action btn-delete" 
                          onClick={() => node.id && handleDeleteNode(node.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Floating Add Node Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Register Gateway Node</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateNode}>
              <div className="form-group">
                <label>Node ID/Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. gemini-gateway-key1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Endpoint URL</label>
                <input 
                  type="url" 
                  className="form-control" 
                  placeholder="e.g. http://igaming-llm-gateway-key1:62002"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Provider Type</label>
                <select 
                  className="form-control" 
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                >
                  <option value="gemini">Google Gemini REST</option>
                  <option value="deepseek">DeepSeek AI</option>
                  <option value="agent-studio">Google Agent Studio</option>
                  <option value="gemini-cli">Gemini Console CLI</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Model</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. gemini-3-flash-preview"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  required 
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
