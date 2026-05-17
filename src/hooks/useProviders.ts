import { useState, useCallback } from 'react';
import { LlmProvider, SupportedProviderConfig, LlmProviderKey } from '../types';
import { apiFetch } from '../utils/api';

export function useProviders() {
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [supportedProviders, setSupportedProviders] = useState<SupportedProviderConfig[]>([]);

  const fetchProviders = useCallback(async () => {
    const data = await apiFetch<LlmProvider[]>('/api/v1/admin/providers');
    if (data !== null) {
      setProviders(data);
      return data;
    }
    return [];
  }, []);

  const fetchSupportedProviders = useCallback(async () => {
    const data = await apiFetch<SupportedProviderConfig[]>('/api/v1/admin/providers/supported');
    if (data !== null) {
      setSupportedProviders(data);
    }
  }, []);

  const saveProvider = async (provider: Partial<LlmProvider>) => {
    const method = provider.id ? "PUT" : "POST";
    const path = provider.id ? `/api/v1/admin/providers/${provider.id}` : '/api/v1/admin/providers';
    
    const data = await apiFetch<LlmProvider>(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(provider)
    });
    if (data !== null) {
      await fetchProviders();
      return true;
    }
    return false;
  };

  const deleteProvider = async (id: number) => {
    const data = await apiFetch<any>(`/api/v1/admin/providers/${id}`, {
      method: "DELETE"
    });
    if (data !== null) {
      await fetchProviders();
      return true;
    }
    return false;
  };

  const fetchKeys = useCallback(async (providerId: number) => {
    const data = await apiFetch<LlmProviderKey[]>(`/api/v1/admin/providers/${providerId}/keys`);
    return data || [];
  }, []);

  const addKey = async (providerId: number, key: Partial<LlmProviderKey>) => {
    const data = await apiFetch<LlmProviderKey>(`/api/v1/admin/providers/${providerId}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...key, active: true })
    });
    return data !== null;
  };

  const deleteKey = async (keyId: number) => {
    const data = await apiFetch<any>(`/api/v1/admin/providers/keys/${keyId}`, {
      method: "DELETE"
    });
    return data !== null;
  };

  return {
    providers,
    supportedProviders,
    fetchProviders,
    fetchSupportedProviders,
    saveProvider,
    deleteProvider,
    fetchKeys,
    addKey,
    deleteKey
  };
}
