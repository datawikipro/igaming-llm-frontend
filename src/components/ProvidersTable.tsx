import React, { useState } from 'react';
import { Database, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { LlmProvider, SupportedProviderConfig } from '../types';

interface ProvidersTableProps {
  providers: LlmProvider[];
  supportedProviders?: SupportedProviderConfig[];
  loading: boolean;
  onSave: (provider: Partial<LlmProvider>) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export const ProvidersTable: React.FC<ProvidersTableProps> = ({ 
  providers, supportedProviders = [], loading, onSave, onDelete 
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (p: LlmProvider) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDisplayName(p.displayName);
  };

  const handleSave = async (id?: number) => {
    const success = await onSave({ id, name: editName, displayName: editDisplayName, active: true });
    if (success) {
      setEditingId(null);
      setIsAdding(false);
      setEditName("");
      setEditDisplayName("");
    }
  };

  return (
    <section className="content-section">
      <div className="section-header">
        <h2>
          <Database size={20} />
          LLM Providers
        </h2>
        <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
          <Plus size={14} /> Add Provider
        </button>
      </div>

      <div className="nodes-table-container">
        <table className="nodes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Technical Name</th>
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
                  <select 
                    className="form-control sm" 
                    value={editName} 
                    onChange={e => {
                      const val = e.target.value;
                      setEditName(val);
                      const matched = supportedProviders.find(sp => sp.name === val);
                      if (matched && !editDisplayName) setEditDisplayName(matched.displayName);
                    }}
                  >
                    <option value="" disabled>Select Provider</option>
                    {supportedProviders.map(sp => (
                      <option key={sp.name} value={sp.name}>{sp.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input className="form-control sm" value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} placeholder="e.g. OpenAI" />
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
            {providers.map(p => (
              <tr key={p.id}>
                <td style={{ color: "#64748b" }}>#{p.id}</td>
                {editingId === p.id ? (
                  <>
                    <td>
                      <select 
                        className="form-control sm" 
                        value={editName} 
                        onChange={e => {
                          const val = e.target.value;
                          setEditName(val);
                          const matched = supportedProviders.find(sp => sp.name === val);
                          if (matched) setEditDisplayName(matched.displayName);
                        }}
                      >
                        <option value="" disabled>Select Provider</option>
                        {supportedProviders.map(sp => (
                          <option key={sp.name} value={sp.name}>{sp.name}</option>
                        ))}
                      </select>
                    </td>
                    <td><input className="form-control sm" value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} /></td>
                  </>
                ) : (
                  <>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.displayName}</td>
                  </>
                )}
                <td>
                  <span className={`status-badge ${p.active ? 'status-healthy' : 'status-down'}`}>
                    {p.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "8px" }}>
                    {editingId === p.id ? (
                      <>
                        <button className="btn btn-action btn-reset" onClick={() => handleSave(p.id)}><Check size={12} /></button>
                        <button className="btn btn-action btn-delete" onClick={() => setEditingId(null)}><X size={12} /></button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-action" onClick={() => handleEdit(p)}><Edit2 size={12} /></button>
                        <button className="btn btn-action btn-delete" onClick={() => onDelete(p.id)}><Trash2 size={12} /></button>
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
