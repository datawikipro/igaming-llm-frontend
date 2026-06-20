import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { LlmModel, LlmQueueSubscription } from '../types';

interface SubscribeQueueModalProps {
  onClose: () => void;
  models: LlmModel[];
  onSave: (payload: Partial<LlmQueueSubscription>) => Promise<boolean>;
}

const DEFAULT_QUEUES = [
  "TEAM_NORMALIZATION",
  "LEAGUE_NORMALIZATION",
  "MARKET_NORMALIZATION",
  "SPORT_NORMALIZATION",
  "MATCH_VERIFICATION",
  "MOTIVATION_ANALYSIS"
];

export const SubscribeQueueModal: React.FC<SubscribeQueueModalProps> = ({ onClose, models, onSave }) => {
  const [queueName, setQueueName] = useState("");
  const [isCustomQueue, setIsCustomQueue] = useState(false);
  const [customQueueName, setCustomQueueName] = useState("");
  const [modelId, setModelId] = useState<string>("");
  const [priority, setPriority] = useState<number>(10);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalQueueName = isCustomQueue ? customQueueName.trim() : queueName;
    if (!finalQueueName || !modelId) return;

    const selectedModel = models.find(m => m.id === parseInt(modelId));
    if (!selectedModel) return;

    setSaving(true);
    const success = await onSave({
      queueName: finalQueueName,
      model: selectedModel,
      priority,
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
            <Layers size={20} style={{ color: '#a855f7', marginRight: '8px', verticalAlign: 'middle' }} />
            Subscribe Model to Queue
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            Subscribe an LLM model to a logical task queue. In this mode, workers running this model will automatically pull tasks from this queue.
          </div>

          <div className="form-group">
            <label>Queue Name (Logical Type)</label>
            {!isCustomQueue ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-control"
                  value={queueName}
                  onChange={(e) => setQueueName(e.target.value)}
                  required
                  style={{ flex: 1 }}
                >
                  <option value="" disabled>Select Queue</option>
                  {DEFAULT_QUEUES.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setIsCustomQueue(true)}
                >
                  Custom
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter custom queue name"
                  value={customQueueName}
                  onChange={(e) => setCustomQueueName(e.target.value)}
                  required
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setIsCustomQueue(false)}
                >
                  Select list
                </button>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>LLM Model</label>
            <select
              className="form-control"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              required
            >
              <option value="" disabled>Select Model</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.displayName || m.modelId} ({m.provider?.name || 'unknown'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Priority (lower number = higher precedence)</label>
            <input
              type="number"
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 10)}
              min={1}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Subscribing..." : "Subscribe Model"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
