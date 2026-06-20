import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { LlmQueueSubscription } from '../types';

export function useQueueSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<LlmQueueSubscription[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<LlmQueueSubscription[]>('/api/v1/admin/queue-subscriptions');
      if (data !== null) {
        setSubscriptions(data);
      }
    } catch (e) {
      console.error("Failed to fetch queue subscriptions:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSubscription = useCallback(async (payload: Partial<LlmQueueSubscription>): Promise<boolean> => {
    try {
      const data = await apiFetch<LlmQueueSubscription>('/api/v1/admin/queue-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (data !== null) {
        await fetchSubscriptions();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to save queue subscription:", e);
      return false;
    }
  }, [fetchSubscriptions]);

  const deleteSubscription = useCallback(async (id: number): Promise<boolean> => {
    try {
      await apiFetch<void>(`/api/v1/admin/queue-subscriptions/${id}`, {
        method: 'DELETE',
      });
      await fetchSubscriptions();
      return true;
    } catch (e) {
      console.error("Failed to delete queue subscription:", e);
      return false;
    }
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    loading,
    fetchSubscriptions,
    saveSubscription,
    deleteSubscription
  };
}
