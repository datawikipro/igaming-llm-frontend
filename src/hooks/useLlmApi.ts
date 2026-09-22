import { useState, useCallback } from 'react';
import { useNodes } from './useNodes';
import { useProviders } from './useProviders';
import { useModels } from './useModels';
import { useQueueStats } from './useQueueStats';
import { useQueueLinks } from './useQueueLinks';

import { useRoutingRules } from './useRoutingRules';
import { useQueueSubscriptions } from './useQueueSubscriptions';

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
    deleteModel,
    syncModels
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
    rules: routingRules,
    loading: routingRulesLoading,
    fetchRules: fetchRoutingRules,
    saveRule: saveRoutingRule,
    deleteRule: deleteRoutingRule
  } = useRoutingRules();

  const {
    subscriptions: queueSubscriptions,
    loading: queueSubscriptionsLoading,
    fetchSubscriptions: fetchQueueSubscriptions,
    saveSubscription: saveQueueSubscription,
    deleteSubscription: deleteQueueSubscription
  } = useQueueSubscriptions();

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
      fetchQueueSubscriptions()
    ]);
    setRefreshing(false);
  }, [fetchNodes, fetchProviders, fetchModels, fetchSupportedProviders, fetchQueueStats, fetchQueueLinks, fetchRoutingRules, fetchQueueSubscriptions]);

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
    syncModels,
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

    queueSubscriptions,
    queueSubscriptionsLoading,
    fetchQueueSubscriptions,
    saveQueueSubscription,
    deleteQueueSubscription
  };
}

