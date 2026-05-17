import React, { useState, useEffect, useCallback } from 'react';
import { Key, Trash2, Plus } from 'lucide-react';
import { LlmProviderKey } from '../types';

interface ProviderKeysManagerProps {
  providerId: number;
  fetchKeys: (providerId: number) => Promise<LlmProviderKey[]>;
  addKey: (providerId: number, key: Partial<LlmProviderKey>) => Promise<boolean>;
  deleteKey: (keyId: number) => Promise<boolean>;
}

export const ProviderKeysManager: React.FC<ProviderKeysManagerProps> = ({
  providerId,
  fetchKeys,
  addKey,
  deleteKey
}) => {
  const [keys, setKeys] = useState<LlmProviderKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await fetchKeys(providerId);
      setKeys(loaded);
    } catch (e) {
      console.error("Failed to load provider keys:", e);
    } finally {
      setLoading(false);
    }
  }, [providerId, fetchKeys]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleAdd = async () => {
    if (!newKeyLabel || !newKeyValue) return;
    const success = await addKey(providerId, { label: newKeyLabel, apiKey: newKeyValue });
    if (success) {
      setNewKeyLabel("");
      setNewKeyValue("");
      loadKeys();
    }
  };

  const handleDelete = async (keyId: number) => {
    const success = await deleteKey(keyId);
    if (success) {
      loadKeys();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
        <Key size={14} /> API Keys & Tokens
      </h3>
      
      {loading ? (
        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading keys...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {keys.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
              No API keys registered for this provider yet.
            </div>
          ) : (
            <table className="sub-table" style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Label</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>API Key / Token (Secret)</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map(k => (
                  <tr key={k.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '6px', color: '#e2e8f0', fontWeight: 500 }}>{k.label}</td>
                    <td style={{ padding: '6px', color: '#64748b', fontFamily: 'monospace' }}>
                      {k.apiKey && k.apiKey.length > 10 ? `${k.apiKey.substring(0, 10)}... (masked)` : k.apiKey}
                    </td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-action btn-delete btn-sm" 
                        onClick={() => handleDelete(k.id!)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {/* Add Key Form */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
            <input 
              className="form-control sm" 
              style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
              placeholder="Key Label (e.g. Production Key)" 
              value={newKeyLabel}
              onChange={e => setNewKeyLabel(e.target.value)}
            />
            <input 
              className="form-control sm" 
              style={{ flex: 2, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
              type="password"
              placeholder="API Key / Token" 
              value={newKeyValue}
              onChange={e => setNewKeyValue(e.target.value)}
            />
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleAdd}
              disabled={!newKeyLabel || !newKeyValue}
            >
              <Plus size={12} /> Add Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
