import React from 'react';
import { AlertTriangle, Trash2, X, Server } from 'lucide-react';
import { LlmModel, LlmGatewayNode } from '../types';

interface ConfirmDeleteModelModalProps {
  model: LlmModel;
  affectedNodes: LlmGatewayNode[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModelModal: React.FC<ConfirmDeleteModelModalProps> = ({
  model,
  affectedNodes,
  onConfirm,
  onCancel,
}) => {
  const hasNodes = affectedNodes.length > 0;
  const activePods = affectedNodes.filter(n => n.leasedByPod);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        style={{ maxWidth: 480 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(239,68,68,0.3)' }}>
          <h2 style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} />
            Удалить модель
          </h2>
          <button className="modal-close" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: '#cbd5e1' }}>
            Вы собираетесь удалить модель{' '}
            <strong style={{ color: '#c084fc' }}>{model.displayName}</strong>{' '}
            (<code style={{ color: '#94a3b8', fontSize: '0.85em' }}>{model.modelId}</code>).
          </p>

          {hasNodes && (
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: '12px 16px',
              }}
            >
              <p style={{ color: '#f87171', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={15} />
                Эта модель используется в {affectedNodes.length} ноде(ах):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {affectedNodes.map(node => (
                  <div
                    key={node.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      background: 'rgba(15,23,42,0.6)',
                      borderRadius: 6,
                      border: '1px solid rgba(100,116,139,0.2)',
                    }}
                  >
                    <Server size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9em' }}>
                        {node.name}
                      </div>
                      {node.leasedByPod && (
                        <div style={{ color: '#94a3b8', fontSize: '0.78em', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Pod: {node.leasedByPod}
                        </div>
                      )}
                    </div>
                    <span
                      className={`status-badge ${node.leasedByPod ? 'status-healthy' : 'status-down'}`}
                      style={{ fontSize: '0.7em', flexShrink: 0 }}
                    >
                      {node.leasedByPod ? 'RUNNING' : 'IDLE'}
                    </span>
                  </div>
                ))}
              </div>

              {activePods.length > 0 && (
                <p style={{ color: '#fca5a5', fontSize: '0.82em', marginTop: 10 }}>
                  ⚠️ {activePods.length} под(а) будут принудительно завершены.
                </p>
              )}
            </div>
          )}

          <p style={{ color: '#94a3b8', fontSize: '0.875em' }}>
            {hasNodes
              ? 'Все перечисленные ноды и их поды будут удалены вместе с моделью. Это действие необратимо.'
              : 'Это действие необратимо.'}
          </p>
        </div>

        {/* Footer */}
        <div
          className="modal-footer"
          style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16 }}
        >
          <button className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
          <button
            className="btn btn-delete"
            style={{
              background: 'rgba(239,68,68,0.15)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={onConfirm}
          >
            <Trash2 size={15} />
            {hasNodes ? `Удалить модель и ${affectedNodes.length} ноду(ы)` : 'Удалить модель'}
          </button>
        </div>
      </div>
    </div>
  );
};
