import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { LlmRoutingRule } from '../types';

export function useRoutingRules() {
  const [rules, setRules] = useState<LlmRoutingRule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<LlmRoutingRule[]>('/api/v1/admin/routing-rules');
      if (data !== null) {
        setRules(data);
      }
    } catch (e) {
      console.error("Failed to fetch routing rules:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRule = useCallback(async (rule: Partial<LlmRoutingRule>, targetModelId: number): Promise<boolean> => {
    try {
      const isEdit = rule.id !== undefined;
      const url = isEdit 
        ? `/api/v1/admin/routing-rules/${rule.id}?targetModelId=${targetModelId}`
        : `/api/v1/admin/routing-rules?targetModelId=${targetModelId}`;
      
      const method = isEdit ? 'PUT' : 'POST';

      const data = await apiFetch<LlmRoutingRule>(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      if (data !== null) {
        await fetchRules();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to save routing rule:", e);
      return false;
    }
  }, [fetchRules]);

  const deleteRule = useCallback(async (id: number): Promise<boolean> => {
    try {
      await apiFetch<void>(`/api/v1/admin/routing-rules/${id}`, {
        method: 'DELETE',
      });
      await fetchRules();
      return true;
    } catch (e) {
      console.error("Failed to delete routing rule:", e);
      return false;
    }
  }, [fetchRules]);

  return {
    rules,
    loading,
    fetchRules,
    saveRule,
    deleteRule
  };
}
