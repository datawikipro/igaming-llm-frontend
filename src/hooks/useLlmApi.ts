import { useState, useCallback } from 'react';
import { LlmGatewayNode, LlmProvider, LlmModel } from '../types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:62001";

export function useLlmApi() {
  const [nodes, setNodes] = useState<LlmGatewayNode[]>([]);
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [models, setModels] = useState<LlmModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNodes = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/nodes`);
      if (res.ok) {
        const data = await res.json();
        setNodes(data);
      }
    } catch (e) {
      console.error("Failed to load gateway nodes:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/providers`);
      if (res.ok) {
        const data = await res.json();
        setProviders(data);
        return data as LlmProvider[];
      }
    } catch (e) {
      console.error("Failed to fetch providers:", e);
    }
    return [];
  }, []);

  const fetchModels = useCallback(async (providerId?: number) => {
    try {
      const url = providerId 
        ? `${BACKEND_URL}/api/v1/admin/models?providerId=${providerId}`
        : `${BACKEND_URL}/api/v1/admin/models`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setModels(data);
        return data as LlmModel[];
      }
    } catch (e) {
      console.error("Failed to fetch models:", e);
    }
    return [];
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNodes(), fetchProviders(), fetchModels()]);
    setRefreshing(false);
  }, [fetchNodes, fetchProviders, fetchModels]);

  // Node CRUD
  const createNode = async (payload: LlmGatewayNode) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchNodes();
        return true;
      }
      return false;
    } catch (e) {
      alert("Error creating gateway node");
      return false;
    }
  };

  const deleteNode = async (id: number) => {
    if (!confirm("Are you sure you want to delete this gateway configuration?")) return false;
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/nodes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchNodes();
        return true;
      }
      return false;
    } catch (e) {
      alert("Error deleting node");
      return false;
    }
  };

  const resetNode = async (id: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/nodes/${id}/reset`, {
        method: "POST"
      });
      if (res.ok) {
        await fetchNodes();
        return true;
      }
      return false;
    } catch (e) {
      alert("Error resetting node");
      return false;
    }
  };

  // Provider CRUD
  const saveProvider = async (provider: Partial<LlmProvider>) => {
    try {
      const url = `${BACKEND_URL}/api/v1/admin/providers`;
      const method = provider.id ? "PUT" : "POST";
      const finalUrl = provider.id ? `${url}/${provider.id}` : url;

      const res = await fetch(finalUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(provider)
      });
      if (res.ok) {
        await fetchProviders();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error saving provider:", e);
      return false;
    }
  };

  const deleteProvider = async (id: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/providers/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchProviders();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error deleting provider:", e);
      return false;
    }
  };

  // Model CRUD
  const saveModel = async (model: Partial<LlmModel>, providerId: number) => {
    try {
      const url = `${BACKEND_URL}/api/v1/admin/models`;
      const method = model.id ? "PUT" : "POST";
      const finalUrl = model.id ? `${url}/${model.id}` : `${url}?providerId=${providerId}`;

      const res = await fetch(finalUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(model)
      });
      if (res.ok) {
        await fetchModels();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error saving model:", e);
      return false;
    }
  };

  const deleteModel = async (id: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/models/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchModels();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error deleting model:", e);
      return false;
    }
  };

  return {
    nodes,
    providers,
    models,
    loading,
    refreshing,
    fetchNodes,
    fetchProviders,
    fetchModels,
    handleRefresh,
    createNode,
    deleteNode,
    resetNode,
    saveProvider,
    deleteProvider,
    saveModel,
    deleteModel
  };
}
