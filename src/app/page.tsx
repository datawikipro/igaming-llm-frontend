"use client";

import React, { useState, useEffect } from "react";
import { Plus, RotateCw, LayoutDashboard, Database, Cpu, Activity, AlertTriangle } from "lucide-react";
import { useLlmApi } from "../hooks/useLlmApi";
import { StatsGrid } from "../components/StatsGrid";
import { NodesTable } from "../components/NodesTable";
import { RegisterNodeModal } from "../components/RegisterNodeModal";
import { ProvidersTable } from "../components/ProvidersTable";
import { ModelsTable } from "../components/ModelsTable";
import { QueueStatsView } from "../components/QueueStatsView";
import { UnmappedOddsView } from "../components/UnmappedOddsView";

type TabType = "nodes" | "providers" | "models" | "queue" | "odds";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("nodes");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") as TabType;
      const validTabs: TabType[] = ["nodes", "providers", "models", "queue", "odds"];
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
    unmappedOdds,
    unmappedOddsLoading,
    fetchUnmappedOdds,
    exportUnmappedOdds
  } = useLlmApi();

  useEffect(() => {
    fetchNodes();
    fetchProviders();
    fetchModels();
    fetchSupportedProviders();
    fetchQueueStats();
    fetchQueueLinks();
    fetchUnmappedOdds();
    
    // Poll nodes status, queue, links & unmapped every 10 seconds
    const interval = setInterval(() => {
      fetchNodes();
      fetchQueueStats();
      fetchQueueLinks();
      fetchUnmappedOdds();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchNodes, fetchProviders, fetchModels, fetchSupportedProviders, fetchQueueStats, fetchQueueLinks, fetchUnmappedOdds]);

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
