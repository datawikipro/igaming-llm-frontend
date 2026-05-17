import { useState, useCallback } from 'react';
import { useNodes } from './useNodes';
import { useProviders } from './useProviders';
import { useModels } from './useModels';
import { useQueueStats } from './useQueueStats';

export function useLlmApi() {
  const [refreshing, setRefreshing] = useState(false);

  const {
    nodes,
    loading,
    fetchNodes,
    createNode,
    deleteNode,
    resetNode
  } = useNodes();

  const {
    providers,
    supportedProviders,
    fetchProviders,
    fetchSupportedProviders,
    saveProvider,
    deleteProvider,
    fetchKeys,
    addKey,
    deleteKey
  } = useProviders();

  const {
    models,
    fetchModels,
    saveModel,
    deleteModel
  } = useModels();

  const {
    stats: queueStats,
    loading: queueStatsLoading,
    fetchStats: fetchQueueStats
  } = useQueueStats();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNodes(),
      fetchProviders(),
      fetchModels(),
      fetchSupportedProviders(),
      fetchQueueStats()
    ]);
    setRefreshing(false);
  }, [fetchNodes, fetchProviders, fetchModels, fetchSupportedProviders, fetchQueueStats]);

  return {
    nodes,
    providers,
    models,
    supportedProviders,
    loading,
    refreshing,
    fetchNodes,
    fetchProviders,
    fetchModels,
    fetchSupportedProviders,
    handleRefresh,
    createNode,
    deleteNode,
    resetNode,
    saveProvider,
    deleteProvider,
    saveModel,
    deleteModel,
    fetchKeys,
    addKey,
    deleteKey,
    queueStats,
    queueStatsLoading,
    fetchQueueStats
  };
}
