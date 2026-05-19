import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { LlmQueueLink } from '../types';

export function useQueueLinks() {
  const [links, setLinks] = useState<LlmQueueLink[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<LlmQueueLink[]>('/api/v1/admin/queue-links');
      if (data !== null) {
        setLinks(data);
      }
    } catch (e) {
      console.error("Failed to fetch queue links:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveLink = useCallback(async (payload: Partial<LlmQueueLink>): Promise<boolean> => {
    try {
      const data = await apiFetch<LlmQueueLink>('/api/v1/admin/queue-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (data !== null) {
        await fetchLinks();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to save queue link:", e);
      return false;
    }
  }, [fetchLinks]);

  const deleteLink = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await apiFetch<void>(`/api/v1/admin/queue-links/${id}`, {
        method: 'DELETE',
      });
      await fetchLinks();
      return true;
    } catch (e) {
      console.error("Failed to delete queue link:", e);
      return false;
    }
  }, [fetchLinks]);

  return {
    links,
    loading,
    fetchLinks,
    saveLink,
    deleteLink
  };
}
