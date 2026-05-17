import { useState, useCallback } from 'react';
import { useNodes } from './useNodes';
import { useProviders } from './useProviders';
import { useModels } from './useModels';

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
    deleteProvider
  } = useProviders();

  const {
    models,
    fetchModels,
    saveModel,
    deleteModel
  } = useModels();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNodes(),
      fetchProviders(),
      fetchModels(),
      fetchSupportedProviders()
    ]);
    setRefreshing(false);
  }, [fetchNodes, fetchProviders, fetchModels, fetchSupportedProviders]);

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
    deleteModel
  };
}
