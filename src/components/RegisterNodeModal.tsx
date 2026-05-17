import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LlmGatewayNode, LlmProvider, LlmModel } from '../types';
import { useLlmApi } from '../hooks/useLlmApi';

interface RegisterNodeModalProps {
  onClose: () => void;
  createNode: (payload: LlmGatewayNode) => Promise<boolean>;
}

export const RegisterNodeModal: React.FC<RegisterNodeModalProps> = ({ onClose, createNode }) => {
  const { fetchProviders, fetchModels } = useLlmApi();
  
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [models, setModels] = useState<LlmModel[]>([]);
  
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [providerType, setProviderType] = useState("");
  const [modelName, setModelName] = useState("");
  const [jsonConfig, setJsonConfig] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const pData = await fetchProviders();
      setProviders(pData);
      if (pData.length > 0) {
        setSelectedProviderId(pData[0].id.toString());
        setProviderType(pData[0].name);
        
        const mData = await fetchModels(pData[0].id);
        setModels(mData);
        if (mData.length > 0) {
          setModelName(mData[0].modelId);
        }
      }
      setLoading(false);
    };
    init();
  }, [fetchProviders, fetchModels]);

  const handleProviderChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedProviderId(pId);
    
    const provider = providers.find(p => p.id.toString() === pId);
    if (provider) {
      setProviderType(provider.name);
      const mData = await fetchModels(provider.id);
      setModels(mData);
      if (mData.length > 0) {
        setModelName(mData[0].modelId);
      } else {
        setModelName("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let parsedName = `node-${providerType}-${Math.random().toString(36).substring(2, 9)}`;
    let parsedEndpoint = "http://igaming-llm-gateway:62002";

    if (jsonConfig.trim()) {
      try {
        const configObj = JSON.parse(jsonConfig);
        if (configObj.name) parsedName = configObj.name;
        if (configObj.endpointUrl) parsedEndpoint = configObj.endpointUrl;
      } catch (err) {
        // Fallback for non-JSON strings
      }
    }

    const selectedModel = models.find(m => m.modelId === modelName);

    const payload: LlmGatewayNode = {
      name: parsedName,
      endpointUrl: parsedEndpoint,
      providerType: providerType,
      modelName,
      apiKey: jsonConfig,
      model: selectedModel,
      active: true,
      status: "HEALTHY",
      suspendedUntil: null,
      successCount: 0,
      failureCount: 0,
      totalTokensUsed: 0,
      lastRequestTime: null
    };

    if (await createNode(payload)) {
      onClose();
    }
  };

  if (loading) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Register Gateway Configuration</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Provider</label>
            <select 
              className="form-control" 
              value={selectedProviderId}
              onChange={handleProviderChange}
              required
            >
              <option value="" disabled>Select Provider</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.displayName} ({p.name})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Model</label>
            <select 
              className="form-control" 
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              required
            >
              <option value="" disabled>Select Model</option>
              {models.map(m => (
                <option key={m.id} value={m.modelId}>{m.displayName} ({m.modelId})</option>
              ))}
              <option value="custom">-- Custom Model ID --</option>
            </select>
          </div>

          {modelName === "custom" && (
            <div className="form-group">
              <label>Custom Model ID</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. gpt-4-turbo"
                onChange={(e) => setModelName(e.target.value)}
                required 
              />
            </div>
          )}

          <div className="form-group">
            <label>Credentials (API Key / JSON)</label>
            <textarea 
              className="form-control" 
              placeholder="Paste API key or Service Account JSON here..."
              rows={5}
              style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              value={jsonConfig}
              onChange={(e) => setJsonConfig(e.target.value)}
              required 
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
