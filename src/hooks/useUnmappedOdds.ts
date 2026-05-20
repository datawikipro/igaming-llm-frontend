import { useState, useCallback } from 'react';
import { apiFetch, BACKEND_URL } from '../utils/api';

export interface UnmappedOdds {
  sourceId: string;
  sportId: string;
  rawName: string;
  count: number;
}

export function useUnmappedOdds() {
  const [unmappedOdds, setUnmappedOdds] = useState<UnmappedOdds[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUnmappedOdds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<UnmappedOdds[]>('/api/v1/admin/odds/unmapped');
      if (data !== null) {
        setUnmappedOdds(data);
      }
    } catch (e) {
      console.error("Failed to fetch unmapped odds:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportUnmappedOdds = useCallback(() => {
    try {
      const url = `${BACKEND_URL}/api/v1/admin/odds/export-md`;
      window.open(url, '_blank');
    } catch (e) {
      console.error("Failed to export unmapped odds:", e);
    }
  }, []);

  return {
    unmappedOdds,
    loading,
    fetchUnmappedOdds,
    exportUnmappedOdds
  };
}
