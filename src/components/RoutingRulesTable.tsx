import React, { useState } from 'react';
import { GitFork, Plus, Trash2, Edit2, Check, X, Search, AlertCircle } from 'lucide-react';
import { LlmRoutingRule, LlmModel } from '../types';

interface RoutingRulesTableProps {
  rules: LlmRoutingRule[];
  models: LlmModel[];
  loading: boolean;
  onSave: (rule: Partial<LlmRoutingRule>, targetModelId: number) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export const RoutingRulesTable: React.FC<RoutingRulesTableProps> = ({
  rules,
  models,
  loading,
  onSave,
  onDelete
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLogicalType, setEditLogicalType] = useState("");
  const [editGoogleRequired, setEditGoogleRequired] = useState<boolean | null>(false);
  const [editUrgency, setEditUrgency] = useState<string>("NORMAL");
  const [selectedModelId, setSelectedModelId] = useState<number>(models[0]?.id || 0);
  const [editActive, setEditActive] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState(false);

  const activeModels = models.filter(m => m.active);

  const handleEdit = (r: LlmRoutingRule) => {
    setEditingId(r.id || null);
    setEditLogicalType(r.logicalType);
    setEditGoogleRequired(r.googleRequired);
    setEditUrgency(r.urgency || "NORMAL");
    if (r.targetModel) setSelectedModelId(r.targetModel.id);
    setEditActive(r.active);
  };

  const handleSave = async (id?: number) => {
    if (!editLogicalType.trim() || !selectedModelId) {
      alert("Logical Type and Target Model are required.");
      return;
    }
    const success = await onSave(
      {
        id,
        logicalType: editLogicalType.trim().toUpperCase(),
        googleRequired: editGoogleRequired,
        urgency: editUrgency,
        active: editActive
      },
      selectedModelId
    );

    if (success) {
      setEditingId(null);
      setIsAdding(false);
      setEditLogicalType("");
      setEditGoogleRequired(false);
      setEditUrgency("NORMAL");
      setEditActive(true);
    }
  };

  const startAdding = () => {
    setIsAdding(true);
    setEditLogicalType("");
    setEditGoogleRequired(false);
    setEditUrgency("NORMAL");
    setEditActive(true);
    if (activeModels.length > 0) {
      setSelectedModelId(activeModels[0].id);
    }
  };

  return (
    <section className="content-section">
      <div className="section-header">
        <h2>
          <GitFork size={20} style={{ color: '#a855f7' }} />
          Dynamic Request Routing Rules
        </h2>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={startAdding}
          disabled={activeModels.length === 0}
          title={activeModels.length === 0 ? "You need active models registered to configure routing rules" : ""}
        >
          <Plus size={14} /> Add Routing Rule
        </button>
      </div>

      {activeModels.length === 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={16} />
          <span>No active models configured! Go to the <strong>Models</strong> tab and configure supported models before setting up routing.</span>
        </div>
      )}

      <div className="nodes-table-container">
        <table className="nodes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Logical Request Type</th>
              <th>Google Required</th>
              <th>Urgency</th>
              <th>Target Model Mapping</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="editing-row">
                <td>NEW</td>
                <td>
                  <input 
                    className="form-control sm" 
                    value={editLogicalType} 
                    onChange={e => setEditLogicalType(e.target.value)} 
                    placeholder="e.g. MATCH_VERIFICATION" 
                    list="logical-type-suggestions"
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
                    value={editGoogleRequired === null ? "ANY" : editGoogleRequired ? "TRUE" : "FALSE"}
                    onChange={e => {
                      const val = e.target.value;
                      setEditGoogleRequired(val === "ANY" ? null : val === "TRUE");
                    }}
                  >
                    <option value="FALSE">No Search Required</option>
                    <option value="TRUE">Search Required</option>
                    <option value="ANY">Any / Disregard Search</option>
                  </select>
                </td>
                <td>
                  <select 
                    className="form-control sm" 
                    value={editUrgency} 
                    onChange={e => setEditUrgency(e.target.value)}
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="LOW">LOW</option>
                  </select>
                </td>
                <td>
                  <select 
                    className="form-control sm" 
                    value={selectedModelId} 
                    onChange={e => setSelectedModelId(Number(e.target.value))}
                  >
                    {activeModels.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.displayName || m.modelId} ({m.provider?.displayName || m.provider?.name})
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className="status-badge status-healthy">NEW</span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "8px" }}>
                    <button className="btn btn-action btn-reset" onClick={() => handleSave()}><Check size={12} /></button>
                    <button className="btn btn-action btn-delete" onClick={() => setIsAdding(false)}><X size={12} /></button>
                  </div>
                </td>
              </tr>
            )}

            {loading && rules.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>
                  Loading request routing rules...
                </td>
              </tr>
            ) : rules.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#64748b", padding: "3rem", fontStyle: "italic" }}>
                  No request routing rules defined yet. Decouple aggregator by registering rules.
                </td>
              </tr>
            ) : (
              rules.map(r => (
                <tr key={r.id}>
                  <td style={{ color: "#64748b" }}>#{r.id}</td>
                  {editingId === r.id ? (
                    <>
                      <td>
                        <input 
                          className="form-control sm" 
                          value={editLogicalType} 
                          onChange={e => setEditLogicalType(e.target.value)} 
                          list="logical-type-suggestions"
                        />
                      </td>
                      <td>
                        <select 
                          className="form-control sm" 
                          value={editGoogleRequired === null ? "ANY" : editGoogleRequired ? "TRUE" : "FALSE"}
                          onChange={e => {
                            const val = e.target.value;
                            setEditGoogleRequired(val === "ANY" ? null : val === "TRUE");
                          }}
                        >
                          <option value="FALSE">No Search Required</option>
                          <option value="TRUE">Search Required</option>
                          <option value="ANY">Any / Disregard Search</option>
                        </select>
                      </td>
                      <td>
                        <select 
                          className="form-control sm" 
                          value={editUrgency} 
                          onChange={e => setEditUrgency(e.target.value)}
                        >
                          <option value="HIGH">HIGH</option>
                          <option value="NORMAL">NORMAL</option>
                          <option value="LOW">LOW</option>
                        </select>
                      </td>
                      <td>
                        <select 
                          className="form-control sm" 
                          value={selectedModelId} 
                          onChange={e => setSelectedModelId(Number(e.target.value))}
                        >
                          {activeModels.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.displayName || m.modelId} ({m.provider?.displayName || m.provider?.name})
                            </option>
                          ))}
                        </select>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ fontWeight: 700, color: "#f8fafc" }}>
                        <span className="badge-model" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                          {r.logicalType}
                        </span>
                      </td>
                      <td>
                        {r.googleRequired === null ? (
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Any</span>
                        ) : r.googleRequired ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#60a5fa', fontWeight: 600 }}>
                            <Search size={12} /> Yes (Google)
                          </span>
                        ) : (
                          <span style={{ color: '#64748b' }}>No</span>
                        )}
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight: 600, 
                          color: r.urgency === 'HIGH' ? '#ef4444' : r.urgency === 'LOW' ? '#94a3b8' : '#3b82f6',
                          fontSize: '0.85rem'
                        }}>
                          {r.urgency || 'NORMAL'}
                        </span>
                      </td>
                      <td>
                        <span className="badge-model" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                          {r.targetModel?.displayName || r.targetModel?.modelId || 'Unknown'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          {r.targetModel?.provider?.displayName || r.targetModel?.provider?.name || 'Unknown Provider'}
                        </span>
                      </td>
                    </>
                  )}
                  <td>
                    {editingId === r.id ? (
                      <select 
                        className="form-control sm" 
                        value={editActive ? "TRUE" : "FALSE"} 
                        onChange={e => setEditActive(e.target.value === "TRUE")}
                      >
                        <option value="TRUE">ACTIVE</option>
                        <option value="FALSE">INACTIVE</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${r.active ? 'status-healthy' : 'status-down'}`}>
                        {r.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                      {editingId === r.id ? (
                        <>
                          <button className="btn btn-action btn-reset" onClick={() => handleSave(r.id)}><Check size={12} /></button>
                          <button className="btn btn-action btn-delete" onClick={() => setEditingId(null)}><X size={12} /></button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-action" onClick={() => handleEdit(r)}><Edit2 size={12} /></button>
                          <button 
                            className="btn btn-action btn-delete" 
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this routing rule?")) {
                                if (r.id !== undefined) await onDelete(r.id);
                              }
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
