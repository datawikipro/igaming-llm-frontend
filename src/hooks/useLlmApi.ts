import { useState, useCallback } from 'react';
import { useNodes } from './useNodes';
import { useProviders } from './useProviders';
import { useModels } from './useModels';
import { useQueueStats } from './useQueueStats';
import { useQueueLinks } from './useQueueLinks';
import { useUnmappedOdds } from './useUnmappedOdds';
import { useRoutingRules } from './useRoutingRules';

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
    fetchModelNodes,
    saveModel,
    deleteModel
  } = useModels();

  const {
    stats: queueStats,
    loading: queueStatsLoading,
    fetchStats: fetchQueueStats
  } = useQueueStats();

  const {
    links: queueLinks,
    loading: queueLinksLoading,
    fetchLinks: fetchQueueLinks,
    saveLink: saveQueueLink,
    deleteLink: deleteQueueLink
  } = useQueueLinks();

  const {
    unmappedOdds,
    loading: unmappedOddsLoading,
    fetchUnmappedOdds,
    exportUnmappedOdds
  } = useUnmappedOdds();

  const {
    rules: routingRules,
    loading: routingRulesLoading,
    fetchRules: fetchRoutingRules,
    saveRule: saveRoutingRule,
    deleteRule: deleteRoutingRule
  } = useRoutingRules();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNodes(),
      fetchProviders(),
      fetchModels(),
      fetchSupportedProviders(),
      fetchQueueStats(),
      fetchQueueLinks(),
      fetchRoutingRules(),
      fetchUnmappedOdds()
    ]);
    setRefreshing(false);
  }, [fetchNodes, fetchProviders, fetchModels, fetchSupportedProviders, fetchQueueStats, fetchQueueLinks, fetchRoutingRules, fetchUnmappedOdds]);

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
    fetchModelNodes,
    fetchKeys,
    addKey,
    deleteKey,
    queueStats,
    queueStatsLoading,
    fetchQueueStats,
    queueLinks,
    queueLinksLoading,
    fetchQueueLinks,
    saveQueueLink,
    deleteQueueLink,
    routingRules,
    routingRulesLoading,
    fetchRoutingRules,
    saveRoutingRule,
    deleteRoutingRule,
    unmappedOdds,
    unmappedOddsLoading,
    fetchUnmappedOdds,
    exportUnmappedOdds
  };
}

