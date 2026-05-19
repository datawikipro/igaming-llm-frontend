import React, { useState } from 'react';
import { X, Link2 } from 'lucide-react';
import { ModelQueueStats } from '../hooks/useQueueStats';
import { LlmQueueLink } from '../types';

interface LinkQueueModalProps {
  onClose: () => void;
  activeQueues: ModelQueueStats[];
  onSave: (payload: Partial<LlmQueueLink>) => Promise<boolean>;
}

export const LinkQueueModal: React.FC<LinkQueueModalProps> = ({ onClose, activeQueues, onSave }) => {
  const [sourceIndex, setSourceIndex] = useState<string>("");
  const [targetIndex, setTargetIndex] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceIndex || !targetIndex) return;

    const sourceQueue = activeQueues[parseInt(sourceIndex)];
    const targetQueue = activeQueues[parseInt(targetIndex)];

    if (sourceQueue.modelName === targetQueue.modelName && sourceQueue.providerType === targetQueue.providerType) {
      alert("Cannot link a queue to itself.");
      return;
    }

    setSaving(true);
    const success = await onSave({
      sourceProvider: sourceQueue.providerType,
      sourceModel: sourceQueue.modelName,
      targetProvider: targetQueue.providerType,
      targetModel: targetQueue.modelName,
      active: true
    });
    setSaving(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>
            <Link2 size={20} style={{ color: '#a855f7', marginRight: '8px', verticalAlign: 'middle' }} />
            Link Queues (Redirection Pool)
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            When two queues are linked, their task pools are merged. If one queue's worker pool is idle, it will automatically help process tasks from the other queue.
          </div>

          <div className="form-group">
            <label>Source Queue (Overloaded / Secondary)</label>
            <select
              className="form-control"
              value={sourceIndex}
              onChange={(e) => setSourceIndex(e.target.value)}
              required
            >
              <option value="" disabled>Select Source Queue</option>
              {activeQueues.map((q, idx) => (
                <option key={`${q.modelName}-${q.providerType}`} value={idx}>
                  {q.modelName} ({q.providerType}) — {q.pendingCount} pending
                </option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#a855f7' }}>
            <Link2 size={24} style={{ transform: 'rotate(90deg)' }} />
          </div>

          <div className="form-group">
            <label>Target Queue (Idle / Main Helper)</label>
            <select
              className="form-control"
              value={targetIndex}
              onChange={(e) => setTargetIndex(e.target.value)}
              required
            >
              <option value="" disabled>Select Target Queue</option>
              {activeQueues.map((q, idx) => (
                <option key={`${q.modelName}-${q.providerType}`} value={idx}>
                  {q.modelName} ({q.providerType}) — {q.pendingCount} pending
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || !sourceIndex || !targetIndex}>
              {saving ? "Linking..." : "Establish Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
