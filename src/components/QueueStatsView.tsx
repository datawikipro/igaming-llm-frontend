import React, { useState } from 'react';
import { Activity, Clock, CheckCircle, Layers, RotateCw, Link2, Unlink, Edit2, Check, X } from 'lucide-react';
import { ModelQueueStats } from '../hooks/useQueueStats';
import { LlmQueueLink, LlmQueueSubscription, LlmModel } from '../types';
import { LinkQueueModal } from './LinkQueueModal';
import { SubscribeQueueModal } from './SubscribeQueueModal';

interface QueueStatsViewProps {
  stats: ModelQueueStats[];
  loading: boolean;
  onRefresh: () => void;
  links: LlmQueueLink[];
  linksLoading: boolean;
  onRefreshLinks: () => void;
  onSaveLink: (payload: Partial<LlmQueueLink>) => Promise<boolean>;
  onDeleteLink: (id: number) => Promise<boolean>;
  subscriptions: LlmQueueSubscription[];
  subscriptionsLoading: boolean;
  onRefreshSubscriptions: () => void;
  onSaveSubscription: (payload: Partial<LlmQueueSubscription>) => Promise<boolean>;
  onDeleteSubscription: (id: number) => Promise<boolean>;
  models: LlmModel[];
}

export const QueueStatsView: React.FC<QueueStatsViewProps> = ({ 
  stats, 
  loading, 
  onRefresh,
  links,
  linksLoading,
  onRefreshLinks,
  onSaveLink,
  onDeleteLink,
  subscriptions,
  subscriptionsLoading,
  onRefreshSubscriptions,
  onSaveSubscription,
  onDeleteSubscription,
  models
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const [editingSubId, setEditingSubId] = useState<number | null>(null);
  const [editSubQueueName, setEditSubQueueName] = useState("");
  const [editSubModelId, setEditSubModelId] = useState<number>(0);
  const [editSubPriority, setEditSubPriority] = useState<number>(10);
  const [editSubActive, setEditSubActive] = useState<boolean>(true);

  const handleEditSubscription = (s: LlmQueueSubscription) => {
    setEditingSubId(s.id || null);
    setEditSubQueueName(s.queueName);
    if (s.model) {
      setEditSubModelId(s.model.id);
    }
    setEditSubPriority(s.priority || 10);
    setEditSubActive(s.active);
  };

  const handleSaveSubscription = async (id: number) => {
    const selectedModel = models.find(m => m.id === editSubModelId);
    if (!selectedModel) {
      alert("Invalid model selected");
      return;
    }
    const success = await onSaveSubscription({
      id,
      queueName: editSubQueueName,
      model: selectedModel,
      priority: editSubPriority,
      active: editSubActive
    });
    if (success) {
      setEditingSubId(null);
      onRefreshSubscriptions();
      onRefresh();
    }
  };

  const handleToggleActive = async (s: LlmQueueSubscription) => {
    if (!s.id || !s.model) return;
    const success = await onSaveSubscription({
      id: s.id,
      queueName: s.queueName,
      model: s.model,
      priority: s.priority,
      active: !s.active
    });
    if (success) {
      onRefreshSubscriptions();
      onRefresh();
    }
  };

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
              onClick={() => setShowSubscribeModal(true)}
              disabled={models.length === 0}
              title="Subscribe a model to a logical task queue"
            >
              <Layers size={14} style={{ marginRight: '4px' }} />
              Subscribe Model
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setShowLinkModal(true)}
              disabled={stats.length < 2}
              title={stats.length < 2 ? "Need at least 2 active queues to establish a redirection" : "Link two queues to share worker resources"}
              style={{ borderColor: 'rgba(168, 85, 247, 0.4)', background: 'rgba(168, 85, 247, 0.05)', color: '#c084fc' }}
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
                    <tr key={s.modelId != null ? `${s.modelId}-${s.providerType}` : `${s.modelName}-${s.providerType}`}>
                      <td style={{ fontWeight: 700, color: "#f8fafc" }}>
                        <span className="badge-model" style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {s.displayName || s.modelName}
                          {isLinked && (
                            <span title="This queue is linked (shared worker resources)">
                              <Link2 size={12} style={{ color: '#a855f7' }} />
                            </span>
                          )}
                        </span>
                        {s.displayName && s.displayName !== s.modelName && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                            {s.modelName}
                          </span>
                        )}
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

      {/* Logical Queue Subscriptions Section */}
      <section className="content-section" style={{ marginTop: '1rem' }}>
        <div className="section-header">
          <h2>
            <Layers size={20} style={{ color: '#10b981' }} />
            Logical Queue Subscriptions (Multi-Model Queuing)
          </h2>
          <button className="btn btn-secondary btn-sm" onClick={onRefreshSubscriptions} disabled={subscriptionsLoading}>
            <RotateCw size={14} className={subscriptionsLoading ? "spin" : ""} />
            {subscriptionsLoading ? "Updating..." : "Refresh Subscriptions"}
          </button>
        </div>

        <div className="nodes-table-container">
          <table className="nodes-table">
            <thead>
              <tr>
                <th>Logical Queue Name</th>
                <th>Subscribed LLM Model</th>
                <th>Provider</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionsLoading && subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#64748b", padding: "2rem" }}>
                    Fetching queue subscriptions...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#64748b", padding: "2rem", fontStyle: "italic" }}>
                    No multi-model queue subscriptions are active. Click "Subscribe Model" above to configure.
                  </td>
                </tr>
              ) : (
                subscriptions.map(s => {
                  const isEditing = editingSubId === s.id;
                  const selectedModelForEdit = models.find(m => m.id === editSubModelId);

                  return (
                    <tr key={s.id} className={isEditing ? "editing-row" : ""}>
                      {isEditing ? (
                        <>
                          <td>
                            <input
                              className="form-control sm"
                              value={editSubQueueName}
                              onChange={e => setEditSubQueueName(e.target.value)}
                              placeholder="Queue Name"
                              list="logical-type-suggestions"
                              style={{ width: '100%' }}
                            />
                            <datalist id="logical-type-suggestions">
                              <option value="TEAM_NORMALIZATION" />
                              <option value="LEAGUE_NORMALIZATION" />
                              <option value="MARKET_NORMALIZATION" />
                              <option value="SPORT_NORMALIZATION" />
                              <option value="MATCH_VERIFICATION" />
                              <option value="MOTIVATION_ANALYSIS" />
                              <option value="GENERAL" />
                            </datalist>
                          </td>
                          <td>
                            <select
                              className="form-control sm"
                              value={editSubModelId}
                              onChange={e => setEditSubModelId(Number(e.target.value))}
                              style={{ width: '100%' }}
                            >
                              {models.map(m => (
                                <option key={m.id} value={m.id}>
                                  {m.displayName || m.modelId} ({m.provider?.displayName || m.provider?.name || 'unknown'})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ textTransform: 'capitalize', color: '#94a3b8' }}>
                            {selectedModelForEdit?.provider?.name || 'unknown'}
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control sm"
                              value={editSubPriority}
                              onChange={e => setEditSubPriority(parseInt(e.target.value) || 10)}
                              min={1}
                              style={{ width: '80px' }}
                            />
                          </td>
                          <td>
                            <select
                              className="form-control sm"
                              value={editSubActive ? "TRUE" : "FALSE"}
                              onChange={e => setEditSubActive(e.target.value === "TRUE")}
                            >
                              <option value="TRUE">ACTIVE</option>
                              <option value="FALSE">INACTIVE</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                className="btn btn-action btn-reset" 
                                onClick={() => s.id && handleSaveSubscription(s.id)}
                                title="Save changes"
                              >
                                <Check size={12} />
                              </button>
                              <button 
                                className="btn btn-action btn-delete" 
                                onClick={() => setEditingSubId(null)}
                                title="Cancel"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ fontWeight: 700, color: '#f8fafc' }}>{s.queueName}</td>
                          <td>
                            <span className="badge-model" style={{ marginRight: '6px' }}>
                              {s.model?.displayName || s.model?.modelId}
                            </span>
                          </td>
                          <td style={{ textTransform: 'capitalize', color: '#94a3b8' }}>
                            {s.model?.provider?.displayName || s.model?.provider?.name || 'unknown'}
                          </td>
                          <td style={{ color: '#cbd5e1' }}>{s.priority || 10}</td>
                          <td>
                            <span 
                              className={`status-badge ${s.active ? 'status-healthy' : 'status-down'}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleToggleActive(s)}
                              title="Click to toggle active status"
                            >
                              {s.active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                              <button 
                                className="btn btn-action" 
                                onClick={() => handleEditSubscription(s)}
                                title="Edit subscription"
                              >
                                <Edit2 size={12} />
                              </button>
                              {s.id !== undefined && (
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to remove model subscription for queue ${s.queueName}?`)) {
                                      await onDeleteSubscription(s.id!);
                                      onRefreshSubscriptions();
                                      onRefresh();
                                    }
                                  }}
                                >
                                  Unsubscribe
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
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

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <SubscribeQueueModal 
          onClose={() => setShowSubscribeModal(false)}
          models={models}
          onSave={async (payload) => {
            const success = await onSaveSubscription(payload);
            if (success) {
              onRefreshSubscriptions();
              onRefresh();
            }
            return success;
          }}
        />
      )}
    </div>
  );
};
