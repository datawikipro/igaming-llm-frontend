import { useState, useCallback } from 'react';
import { LlmGatewayNode } from '../types';
import { apiFetch } from '../utils/api';

export function useNodes() {
  const [nodes, setNodes] = useState<LlmGatewayNode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNodes = useCallback(async () => {
    const data = await apiFetch<LlmGatewayNode[]>('/api/v1/admin/nodes');
    if (data !== null) {
      setNodes(data);
    }
    setLoading(false);
  }, []);

  const createNode = async (payload: LlmGatewayNode) => {
    const data = await apiFetch<any>('/api/v1/admin/nodes', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (data !== null) {
      await fetchNodes();
      return true;
    }
    alert("Error creating gateway node");
    return false;
  };

  const deleteNode = async (id: number) => {
    if (!confirm("Are you sure you want to delete this gateway configuration?")) return false;
    const data = await apiFetch<any>(`/api/v1/admin/nodes/${id}`, {
      method: "DELETE"
    });
    if (data !== null) {
      await fetchNodes();
      return true;
    }
    alert("Error deleting node");
    return false;
  };

  const resetNode = async (id: number) => {
    const data = await apiFetch<any>(`/api/v1/admin/nodes/${id}/reset`, {
      method: "POST"
    });
    if (data !== null) {
      await fetchNodes();
      return true;
    }
    alert("Error resetting node");
    return false;
  };

  return {
    nodes,
    loading,
    fetchNodes,
    createNode,
    deleteNode,
    resetNode
  };
}
