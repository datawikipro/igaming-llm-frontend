import React, { useState } from 'react';
import { Cpu, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { LlmModel, LlmProvider, SupportedProviderConfig } from '../types';

interface ModelsTableProps {
  models: LlmModel[];
  providers: LlmProvider[];
  supportedProviders?: SupportedProviderConfig[];
  loading: boolean;
  onSave: (model: Partial<LlmModel>, providerId: number) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export const ModelsTable: React.FC<ModelsTableProps> = ({ 
  models, providers, supportedProviders = [], loading, onSave, onDelete 
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editModelId, setEditModelId] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState<number>(providers[0]?.id || 0);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (m: LlmModel) => {
    setEditingId(m.id);
    setEditModelId(m.modelId);
    setEditDisplayName(m.displayName);
    if (m.provider) setSelectedProviderId(m.provider.id);
  };

  const handleSave = async (id?: number) => {
    const success = await onSave(
      { id, modelId: editModelId, displayName: editDisplayName, active: true },
      selectedProviderId
    );
    if (success) {
      setEditingId(null);
      setIsAdding(false);
      setEditModelId("");
      setEditDisplayName("");
    }
  };

  const getAvailableModels = (providerId?: number) => {
    const p = providers.find(p => p.id === providerId);
    return supportedProviders.find(sp => sp.name === p?.name)?.models || [];
  };

  return (
    <section className="content-section">
      <div className="section-header">
        <h2>
          <Cpu size={20} />
          Supported Models
        </h2>
        <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
          <Plus size={14} /> Add Model
        </button>
      </div>

      <div className="nodes-table-container">
        <table className="nodes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Provider</th>
              <th>Model ID</th>
              <th>Display Name</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="editing-row">
                <td>NEW</td>
                <td>
                  <select className="form-control sm" value={selectedProviderId} onChange={e => setSelectedProviderId(Number(e.target.value))}>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.displayName}</option>)}
                  </select>
                </td>
                <td>
                  <input 
                    className="form-control sm" 
                    value={editModelId} 
                    onChange={e => setEditModelId(e.target.value)} 
                    placeholder="e.g. gpt-4" 
                    list="new-model-list"
                  />
                  <datalist id="new-model-list">
                    {getAvailableModels(selectedProviderId).map(m => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </td>
                <td>
                  <input className="form-control sm" value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} placeholder="e.g. GPT-4 Turbo" />
                </td>
                <td><span className="status-badge status-healthy">NEW</span></td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "8px" }}>
                    <button className="btn btn-action btn-reset" onClick={() => handleSave()}><Check size={12} /></button>
                    <button className="btn btn-action btn-delete" onClick={() => setIsAdding(false)}><X size={12} /></button>
                  </div>
                </td>
              </tr>
            )}
            {models.map(m => (
              <tr key={m.id}>
                <td style={{ color: "#64748b" }}>#{m.id}</td>
                <td>
                   <span className="status-badge" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                      {m.provider?.displayName || "Unknown"}
                    </span>
                </td>
                {editingId === m.id ? (
                  <>
                    <td>
                      <input 
                        className="form-control sm" 
                        value={editModelId} 
                        onChange={e => setEditModelId(e.target.value)} 
                        list={`edit-model-list-${m.id}`}
                      />
                      <datalist id={`edit-model-list-${m.id}`}>
                        {getAvailableModels(m.provider?.id).map(mod => (
                          <option key={mod} value={mod} />
                        ))}
                      </datalist>
                    </td>
                    <td><input className="form-control sm" value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} /></td>
                  </>
                ) : (
                  <>
                    <td style={{ fontWeight: 600 }}>{m.modelId}</td>
                    <td>{m.displayName}</td>
                  </>
                )}
                <td>
                  <span className={`status-badge ${m.active ? 'status-healthy' : 'status-down'}`}>
                    {m.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "8px" }}>
                    {editingId === m.id ? (
                      <>
                        <button className="btn btn-action btn-reset" onClick={() => handleSave(m.id)}><Check size={12} /></button>
                        <button className="btn btn-action btn-delete" onClick={() => setEditingId(null)}><X size={12} /></button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-action" onClick={() => handleEdit(m)}><Edit2 size={12} /></button>
                        <button className="btn btn-action btn-delete" onClick={() => onDelete(m.id)}><Trash2 size={12} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
