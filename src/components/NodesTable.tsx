import React from 'react';
import { Activity, Plus, RefreshCw, Trash2, Globe } from 'lucide-react';
import { LlmGatewayNode } from '../types';

interface NodesTableProps {
  nodes: LlmGatewayNode[];
  loading: boolean;
  onRegisterClick: () => void;
  onResetNode: (id: number) => void;
  onDeleteNode: (id: number) => void;
}

export const NodesTable: React.FC<NodesTableProps> = ({ 
  nodes, loading, onRegisterClick, onResetNode, onDeleteNode 
}) => {
  return (
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
          <button className="btn btn-primary" onClick={onRegisterClick}>
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
                      {node.model?.provider?.displayName || node.model?.provider?.name || node.providerType || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="badge-model">
                      {node.model?.displayName || node.model?.modelId || node.modelName || '—'}
                    </span>
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
                          onClick={() => node.id && onResetNode(node.id)}
                        >
                          <RefreshCw size={12} />
                          Reset
                        </button>
                      )}
                      <button 
                        className="btn btn-action btn-delete" 
                        onClick={() => node.id && onDeleteNode(node.id)}
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
  );
};
