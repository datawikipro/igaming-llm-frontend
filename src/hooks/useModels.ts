import { useState, useCallback } from 'react';
import { LlmModel } from '../types';
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

  return {
    models,
    fetchModels,
    saveModel,
    deleteModel
  };
}
