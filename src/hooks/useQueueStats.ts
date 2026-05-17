import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';

export interface ModelQueueStats {
  modelName: string;
  providerType: string;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  processedPerHour: number;
}

export function useQueueStats() {
  const [stats, setStats] = useState<ModelQueueStats[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<ModelQueueStats[]>('/api/v1/admin/gateway/stats');
      if (data !== null) {
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch gateway stats:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    fetchStats
  };
}
