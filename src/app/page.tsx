"use client";

import React, { useState, useEffect } from "react";
import { Plus, RotateCw, LayoutDashboard, Database, Cpu, Activity, AlertTriangle, GitFork } from "lucide-react";
import { useLlmApi } from "../hooks/useLlmApi";
import { StatsGrid } from "../components/StatsGrid";
import { NodesTable } from "../components/NodesTable";
import { RegisterNodeModal } from "../components/RegisterNodeModal";
import { ProvidersTable } from "../components/ProvidersTable";
import { ModelsTable } from "../components/ModelsTable";
import { QueueStatsView } from "../components/QueueStatsView";
import { UnmappedOddsView } from "../components/UnmappedOddsView";
import { RoutingRulesTable } from "../components/RoutingRulesTable";

type TabType = "nodes" | "providers" | "models" | "queue" | "odds" | "rules";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("nodes");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") as TabType;
      const validTabs: TabType[] = ["nodes", "providers", "models", "queue", "odds", "rules"];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      } else {
        setActiveTab("nodes");
        window.location.hash = "nodes";
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };
  
  const {
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
  } = useLlmApi();

  // Lazy load data dynamically when the active tab changes (or on mount for the default tab)
  useEffect(() => {
    if (activeTab === "nodes") {
      fetchNodes();
      fetchProviders();
      fetchModels();
    } else if (activeTab === "providers") {
      fetchProviders();
      fetchSupportedProviders();
    } else if (activeTab === "models") {
      fetchModels();
      fetchProviders();
    } else if (activeTab === "queue") {
      fetchQueueStats();
      fetchQueueLinks();
    } else if (activeTab === "odds") {
      fetchUnmappedOdds();
    } else if (activeTab === "rules") {
      fetchRoutingRules();
      fetchModels();
    }
  }, [activeTab, fetchNodes, fetchProviders, fetchModels, fetchSupportedProviders, fetchQueueStats, fetchQueueLinks, fetchRoutingRules, fetchUnmappedOdds]);

  // Tab-specific background polling
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "nodes") {
        fetchNodes();
      } else if (activeTab === "queue") {
        fetchQueueStats();
        fetchQueueLinks();
      } else if (activeTab === "odds") {
        fetchUnmappedOdds();
      } else if (activeTab === "rules") {
        fetchRoutingRules();
      }
    }, activeTab === "odds" ? 20000 : 10000); // 20s for heavy unmapped odds, 10s for other status

    return () => clearInterval(interval);
  }, [activeTab, fetchNodes, fetchQueueStats, fetchQueueLinks, fetchRoutingRules, fetchUnmappedOdds]);

  return (
    <main className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>LLM Control Center</h1>
          <p>Decoupled gateway infrastructure management</p>
        </div>
        <div className="header-actions" style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
            <RotateCw size={16} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          {activeTab === "nodes" && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} />
              Add Lease
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === "nodes" ? "active" : ""}`}
          onClick={() => handleTabChange("nodes")}
        >
          <LayoutDashboard size={18} />
          Active Leases
        </button>
        <button 
          className={`tab-btn ${activeTab === "providers" ? "active" : ""}`}
          onClick={() => handleTabChange("providers")}
        >
          <Database size={18} />
          Providers
        </button>
        <button 
          className={`tab-btn ${activeTab === "models" ? "active" : ""}`}
          onClick={() => handleTabChange("models")}
        >
          <Cpu size={18} />
          Models
        </button>
        <button 
          className={`tab-btn ${activeTab === "queue" ? "active" : ""}`}
          onClick={() => handleTabChange("queue")}
        >
          <Activity size={18} />
          Gateway Queue
        </button>
        <button 
          className={`tab-btn ${activeTab === "odds" ? "active" : ""}`}
          onClick={() => handleTabChange("odds")}
        >
          <AlertTriangle size={18} />
          Unmapped ODDS
        </button>
        <button 
          className={`tab-btn ${activeTab === "rules" ? "active" : ""}`}
          onClick={() => handleTabChange("rules")}
        >
          <GitFork size={18} />
          Routing Rules
        </button>
      </div>

      {activeTab === "nodes" && (
        <>
          <StatsGrid nodes={nodes} />
          <NodesTable 
            nodes={nodes} 
            loading={loading} 
            onRegisterClick={() => setShowModal(true)}
            onResetNode={resetNode}
            onDeleteNode={deleteNode}
          />
        </>
      )}

      {activeTab === "providers" && (
        <ProvidersTable 
          providers={providers} 
          supportedProviders={supportedProviders}
          loading={loading} 
          onSave={saveProvider} 
          onDelete={deleteProvider} 
          fetchKeys={fetchKeys}
          addKey={addKey}
          deleteKey={deleteKey}
        />
      )}

      {activeTab === "models" && (
        <ModelsTable 
          models={models} 
          providers={providers}
          supportedProviders={supportedProviders}
          loading={loading} 
          onSave={saveModel} 
          onDelete={deleteModel}
          onFetchModelNodes={fetchModelNodes}
        />
      )}

      {activeTab === "queue" && (
        <QueueStatsView 
          stats={queueStats} 
          loading={queueStatsLoading} 
          onRefresh={fetchQueueStats} 
          links={queueLinks}
          linksLoading={queueLinksLoading}
          onRefreshLinks={fetchQueueLinks}
          onSaveLink={saveQueueLink}
          onDeleteLink={deleteQueueLink}
        />
      )}

      {activeTab === "odds" && (
        <UnmappedOddsView 
          unmappedOdds={unmappedOdds} 
          loading={unmappedOddsLoading} 
          onRefresh={fetchUnmappedOdds} 
          onExport={exportUnmappedOdds}
        />
      )}

      {activeTab === "rules" && (
        <RoutingRulesTable 
          rules={routingRules}
          models={models}
          loading={routingRulesLoading}
          onSave={saveRoutingRule}
          onDelete={deleteRoutingRule}
        />
      )}

      {/* Floating Modal - repurpose based on tab or keep specific for nodes for now */}
      {showModal && activeTab === "nodes" && (
        <RegisterNodeModal 
          onClose={() => setShowModal(false)} 
          createNode={createNode} 
        />
      )}
      
      {/* TODO: Add modals for Providers/Models if simple inline edit is not enough */}
    </main>
  );
}
