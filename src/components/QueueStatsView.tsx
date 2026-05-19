import React, { useState } from 'react';
import { Activity, Clock, CheckCircle, Layers, RotateCw, Link2, Unlink } from 'lucide-react';
import { ModelQueueStats } from '../hooks/useQueueStats';
import { LlmQueueLink } from '../types';
import { LinkQueueModal } from './LinkQueueModal';

interface QueueStatsViewProps {
  stats: ModelQueueStats[];
  loading: boolean;
  onRefresh: () => void;
  links: LlmQueueLink[];
  linksLoading: boolean;
  onRefreshLinks: () => void;
  onSaveLink: (payload: Partial<LlmQueueLink>) => Promise<boolean>;
  onDeleteLink: (id: number) => Promise<boolean>;
}

export const QueueStatsView: React.FC<QueueStatsViewProps> = ({ 
  stats, 
  loading, 
  onRefresh,
  links,
  linksLoading,
  onRefreshLinks,
  onSaveLink,
  onDeleteLink
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);

  const totalPending = stats.reduce((sum, s) => sum + s.pendingCount, 0);
  const totalProcessing = stats.reduce((sum, s) => sum + s.processingCount, 0);
  const totalCompleted = stats.reduce((sum, s) => sum + s.completedCount, 0);
  const totalFailed = stats.reduce((sum, s) => sum + s.failedCount, 0);
  const totalProcessedPerHour = stats.reduce((sum, s) => sum + s.processedPerHour, 0);

  const successRate = totalCompleted + totalFailed > 0
    ? ((totalCompleted / (totalCompleted + totalFailed)) * 100).toFixed(1)
    : "100";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Mini Stats Summary */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Pending Queue</span>
            <span className="stat-value">{totalPending}</span>
          </div>
          <div className="stat-icon purple">
            <Layers size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Currently Processing</span>
            <span className="stat-value">{totalProcessing}</span>
          </div>
          <div className="stat-icon blue">
            <Activity size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Processed / Hour</span>
            <span className="stat-value">{totalProcessedPerHour}</span>
          </div>
          <div className="stat-icon green">
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-title">Overall Success</span>
            <span className="stat-value">{successRate}%</span>
          </div>
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
        </div>
      </section>

      {/* Main Details Section */}
      <section className="content-section">
        <div className="section-header">
          <h2>
            <Activity size={20} style={{ color: '#a855f7' }} />
            Gateway Queue Metrics by Model
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setShowLinkModal(true)}
              disabled={stats.length < 2}
              title={stats.length < 2 ? "Need at least 2 active queues to establish a redirection" : "Link two queues to share worker resources"}
            >
              <Link2 size={14} style={{ marginRight: '4px' }} />
              Link Queues
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading}>
              <RotateCw size={14} className={loading ? "spin" : ""} />
              {loading ? "Updating..." : "Refresh Queue"}
            </button>
          </div>
        </div>

        <div className="nodes-table-container">
          <table className="nodes-table">
            <thead>
              <tr>
                <th>Model Name</th>
                <th>Provider</th>
                <th>Pending (In Queue)</th>
                <th>Processing</th>
                <th>Completed (Total)</th>
                <th>Failed (Total)</th>
                <th>Processed (Last Hour)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && stats.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>
                    Fetching gateway statistics...
                  </td>
                </tr>
              ) : stats.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#64748b", padding: "3rem", fontStyle: "italic" }}>
                    No queue metrics are active or registered on the gateway yet.
                  </td>
                </tr>
              ) : (
                stats.map(s => {
                  const isBusy = s.pendingCount > 0 || s.processingCount > 0;

                  // Find if this queue is part of any linked queue mapping
                  const isLinked = links.some(l => 
                    (l.sourceProvider === s.providerType && l.sourceModel === s.modelName) ||
                    (l.targetProvider === s.providerType && l.targetModel === s.modelName)
                  );

                  return (
                    <tr key={`${s.modelName}-${s.providerType}`}>
                      <td style={{ fontWeight: 700, color: "#f8fafc" }}>
                        <span className="badge-model" style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {s.modelName}
                          {isLinked && (
                            <Link2 size={12} style={{ color: '#a855f7' }} title="This queue is linked (shared worker resources)" />
                          )}
                        </span>
                      </td>
                      <td style={{ textTransform: "capitalize", color: "#94a3b8" }}>
                        {s.providerType}
                      </td>
                      <td style={{ fontWeight: s.pendingCount > 0 ? 700 : 400, color: s.pendingCount > 0 ? "#a855f7" : "#cbd5e1" }}>
                        {s.pendingCount}
                      </td>
                      <td style={{ fontWeight: s.processingCount > 0 ? 700 : 400, color: s.processingCount > 0 ? "#3b82f6" : "#cbd5e1" }}>
                        {s.processingCount}
                      </td>
                      <td style={{ color: "#10b981", fontWeight: 500 }}>
                        {s.completedCount.toLocaleString()}
                      </td>
                      <td style={{ color: s.failedCount > 0 ? "#ef4444" : "#64748b" }}>
                        {s.failedCount.toLocaleString()}
                      </td>
                      <td style={{ color: "#3b82f6", fontWeight: 700 }}>
                        {s.processedPerHour} req/hr
                      </td>
                      <td>
                        <span className={`status-badge ${isBusy ? 'status-exhausted' : 'status-healthy'}`}>
                          {isBusy ? 'BUSY' : 'IDLE'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Queue Redirections Section */}
      <section className="content-section" style={{ marginTop: '1rem' }}>
        <div className="section-header">
          <h2>
            <Link2 size={20} style={{ color: '#3b82f6' }} />
            Active Queue Redirections (Shared Resource Pools)
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={onRefreshLinks} disabled={linksLoading}>
            <RotateCw size={14} className={linksLoading ? "spin" : ""} />
            {linksLoading ? "Updating..." : "Refresh Links"}
          </button>
        </div>

        <div className="nodes-table-container">
          <table className="nodes-table">
            <thead>
              <tr>
                <th>Queue A (Source Pool)</th>
                <th>Relationship</th>
                <th>Queue B (Target Helper Pool)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {linksLoading && links.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>
                    Fetching redirection configurations...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "2rem", fontStyle: "italic" }}>
                    No queue redirections are active. Use the "Link Queues" button to merge workloads.
                  </td>
                </tr>
              ) : (
                links.map(l => (
                  <tr key={l.id}>
                    <td>
                      <span className="badge-model" style={{ marginRight: '6px' }}>{l.sourceModel}</span>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({l.sourceProvider})</span>
                    </td>
                    <td style={{ color: '#a855f7', fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Link2 size={14} />
                        Connected (Bidirectional helper)
                      </span>
                    </td>
                    <td>
                      <span className="badge-model" style={{ marginRight: '6px' }}>{l.targetModel}</span>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({l.targetProvider})</span>
                    </td>
                    <td>
                      <span className={`status-badge ${l.active ? 'status-healthy' : 'status-down'}`}>
                        {l.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      {l.id !== undefined && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                          onClick={async () => {
                            if (confirm("Are you sure you want to remove this queue redirection link?")) {
                              await onDeleteLink(l.id!);
                              onRefresh();
                            }
                          }}
                        >
                          <Unlink size={14} style={{ marginRight: '4px' }} />
                          Unlink Pools
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Linking Modal */}
      {showLinkModal && (
        <LinkQueueModal 
          onClose={() => setShowLinkModal(false)}
          activeQueues={stats}
          onSave={async (payload) => {
            const success = await onSaveLink(payload);
            if (success) {
              onRefresh();
              onRefreshLinks();
            }
            return success;
          }}
        />
      )}
    </div>
  );
};
