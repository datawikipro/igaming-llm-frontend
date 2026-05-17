import React from 'react';
import { Activity, Clock, CheckCircle, AlertTriangle, Layers, RotateCw } from 'lucide-react';
import { ModelQueueStats } from '../hooks/useQueueStats';

interface QueueStatsViewProps {
  stats: ModelQueueStats[];
  loading: boolean;
  onRefresh: () => void;
}

export const QueueStatsView: React.FC<QueueStatsViewProps> = ({ stats, loading, onRefresh }) => {
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
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading}>
            <RotateCw size={14} className={loading ? "spin" : ""} />
            {loading ? "Updating..." : "Refresh Queue"}
          </button>
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
                  const modelSuccessRate = s.completedCount + s.failedCount > 0
                    ? (s.completedCount / (s.completedCount + s.failedCount)) * 100
                    : 100;

                  const isBusy = s.pendingCount > 0 || s.processingCount > 0;

                  return (
                    <tr key={`${s.modelName}-${s.providerType}`}>
                      <td style={{ fontWeight: 700, color: "#f8fafc" }}>
                        <span className="badge-model" style={{ marginRight: '8px' }}>
                          {s.modelName}
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
    </div>
  );
};
