import { useState, useCallback } from 'react';
import { LlmModel, LlmGatewayNode } from '../types';
import { apiFetch } from '../utils/api';

export function useModels() {
  const [models, setModels] = useState<LlmModel[]>([]);

  const fetchModels = useCallback(async (providerId?: number) => {
    const path = providerId 
      ? `/api/v1/admin/models?providerId=${providerId}`
      : '/api/v1/admin/models';
    const data = await apiFetch<LlmModel[]>(path);
    if (data !== null) {
      setModels(data);
      return data;
    }
    return [];
  }, []);

  const fetchModelNodes = useCallback(async (modelId: number): Promise<LlmGatewayNode[]> => {
    const data = await apiFetch<LlmGatewayNode[]>(`/api/v1/admin/models/${modelId}/nodes`);
    return data ?? [];
  }, []);

  const saveModel = async (model: Partial<LlmModel>, providerId: number) => {
    const method = model.id ? "PUT" : "POST";
    const path = model.id 
      ? `/api/v1/admin/models/${model.id}` 
      : `/api/v1/admin/models?providerId=${providerId}`;

    const data = await apiFetch<LlmModel>(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(model)
    });
    if (data !== null) {
      await fetchModels();
      return true;
    }
    return false;
  };

  const deleteModel = async (id: number) => {
    const data = await apiFetch<any>(`/api/v1/admin/models/${id}`, {
      method: "DELETE"
    });
    if (data !== null) {
      await fetchModels();
      return true;
    }
    return false;
  };

  const syncModels = async () => {
    const data = await apiFetch<any>('/api/v1/admin/models/sync', {
      method: "POST"
    });
    if (data !== null) {
      await fetchModels();
      return data;
    }
    return null;
  };

  return {
    models,
    fetchModels,
    fetchModelNodes,
    saveModel,
    deleteModel,
    syncModels
  };
}
