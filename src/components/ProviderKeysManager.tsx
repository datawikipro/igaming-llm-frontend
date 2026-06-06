import React, { useState, useEffect, useCallback } from 'react';
import { Key, Trash2, Plus, RefreshCw } from 'lucide-react';
import { LlmProviderKey } from '../types';
import { apiFetch } from '../utils/api';

interface ProviderKeysManagerProps {
  providerId: number;
  providerName: string;
  fetchKeys: (providerId: number) => Promise<LlmProviderKey[]>;
  addKey: (providerId: number, key: Partial<LlmProviderKey>) => Promise<boolean>;
  deleteKey: (keyId: number) => Promise<boolean>;
}

export const ProviderKeysManager: React.FC<ProviderKeysManagerProps> = ({
  providerId,
  providerName,
  fetchKeys,
  addKey,
  deleteKey
}) => {
  const [keys, setKeys] = useState<LlmProviderKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [resolving, setResolving] = useState(false);

  const isOauth = providerName === 'gemini-cli' || providerName.toLowerCase().includes('oauth');

  const extractEmailFromKey = (keyValue: string): string => {
    try {
      const trimmed = keyValue.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        const root = JSON.parse(trimmed);
        if (root.id_token) {
          const parts = root.id_token.split('.');
          if (parts.length >= 2) {
            const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const decodedJson = atob(payloadBase64);
            const payload = JSON.parse(decodedJson);
            if (payload.email) {
              return payload.email;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to extract email locally:", e);
    }
    return "OAuth Key";
  };

  const handleResolveEmails = async () => {
    setResolving(true);
    try {
      await apiFetch('/api/v1/admin/providers/keys/resolve-emails', {
        method: 'POST'
      });
      await loadKeys();
    } catch (e) {
      console.error("Failed to resolve emails:", e);
    } finally {
      setResolving(false);
    }
  };

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
    if (!newKeyValue) return;
    
    let label = newKeyLabel;
    if (isOauth) {
      label = extractEmailFromKey(newKeyValue);
    } else if (!label) {
      return;
    }

    const success = await addKey(providerId, { label, apiKey: newKeyValue });
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

  const getStatusBadge = (k: LlmProviderKey) => {
    if (!k.active) {
      return (
        <span style={{ 
          padding: '2px 6px', 
          borderRadius: '4px', 
          fontSize: '0.75rem', 
          background: 'rgba(239, 68, 68, 0.15)', 
          color: '#ef4444', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          🚫 Блок возраста / Неактивен
        </span>
      );
    }
    
    const activeSuspensions = (k.modelSuspensions || []).filter(s => {
      return new Date(s.suspendedUntil).getTime() > Date.now();
    });

    if (activeSuspensions.length > 0) {
      const items = activeSuspensions.map(s => {
        const suspendedTime = new Date(s.suspendedUntil).getTime();
        const now = new Date().getTime();
        const timeLeftMin = Math.round((suspendedTime - now) / 60000);
        const timeLeftHours = Math.floor(timeLeftMin / 60);
        const timeLeftMins = timeLeftMin % 60;
        const timeLeftStr = timeLeftHours > 0 ? `${timeLeftHours}ч ${timeLeftMins}м` : `${timeLeftMin}м`;
        return {
          label: s.modelName,
          timeStr: new Date(s.suspendedUntil).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          timeLeftStr
        };
      });

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map((item, idx) => (
            <span key={idx} style={{ 
              padding: '2px 6px', 
              borderRadius: '4px', 
              fontSize: '0.75rem', 
              background: 'rgba(245, 158, 11, 0.15)', 
              color: '#f59e0b', 
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}>
              ⏳ {item.label}: Лимит (до {item.timeStr}, ост. {item.timeLeftStr})
            </span>
          ))}
        </div>
      );
    }

    return (
      <span style={{ 
        padding: '2px 6px', 
        borderRadius: '4px', 
        fontSize: '0.75rem', 
        background: 'rgba(16, 185, 129, 0.15)', 
        color: '#10b981', 
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        ✅ Активен
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
          <Key size={14} /> {isOauth ? 'OAuth Accounts' : 'API Keys & Tokens'}
        </h3>
        {isOauth && (
          <button 
            className="btn btn-secondary btn-sm"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.75rem',
              padding: '4px 8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
            onClick={handleResolveEmails}
            disabled={resolving || loading}
          >
            <RefreshCw size={12} className={resolving ? 'spin' : ''} />
            {resolving ? 'Resolving...' : 'Sync/Resolve Emails'}
          </button>
        )}
      </div>
      
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
                  <th style={{ textAlign: 'left', padding: '6px' }}>{isOauth ? 'Email' : 'Label'}</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>API Key / Token (Secret)</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>Status</th>
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
                    <td style={{ padding: '6px' }}>{getStatusBadge(k)}</td>
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
            {!isOauth && (
              <input 
                className="form-control sm" 
                style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="Key Label (e.g. Production Key)" 
                value={newKeyLabel}
                onChange={e => setNewKeyLabel(e.target.value)}
              />
            )}
            <input 
              className="form-control sm" 
              style={{ flex: isOauth ? 3 : 2, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
              type="password"
              placeholder={isOauth ? "Paste OAuth Credentials JSON (starting with { )" : "API Key / Token"} 
              value={newKeyValue}
              onChange={e => setNewKeyValue(e.target.value)}
            />
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleAdd}
              disabled={isOauth ? !newKeyValue : (!newKeyLabel || !newKeyValue)}
            >
              <Plus size={12} /> Add Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
