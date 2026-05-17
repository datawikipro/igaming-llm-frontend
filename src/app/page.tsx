"use client";

import React, { useState, useEffect } from "react";
import { Plus, RotateCw, LayoutDashboard, Database, Cpu, Activity } from "lucide-react";
import { useLlmApi } from "../hooks/useLlmApi";
import { StatsGrid } from "../components/StatsGrid";
import { NodesTable } from "../components/NodesTable";
import { RegisterNodeModal } from "../components/RegisterNodeModal";
import { ProvidersTable } from "../components/ProvidersTable";
import { ModelsTable } from "../components/ModelsTable";
import { QueueStatsView } from "../components/QueueStatsView";

type TabType = "nodes" | "providers" | "models" | "queue";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("nodes");
  const [showModal, setShowModal] = useState(false);
  
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
    fetchKeys,
    addKey,
    deleteKey,
    queueStats,
    queueStatsLoading,
    fetchQueueStats
  } = useLlmApi();

  useEffect(() => {
    fetchNodes();
    fetchProviders();
    fetchModels();
    fetchSupportedProviders();
    fetchQueueStats();
    
    // Poll nodes status & queue every 10 seconds
    const interval = setInterval(() => {
      fetchNodes();
      fetchQueueStats();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchNodes, fetchProviders, fetchModels, fetchSupportedProviders, fetchQueueStats]);

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
          onClick={() => setActiveTab("nodes")}
        >
          <LayoutDashboard size={18} />
          Active Leases
        </button>
        <button 
          className={`tab-btn ${activeTab === "providers" ? "active" : ""}`}
          onClick={() => setActiveTab("providers")}
        >
          <Database size={18} />
          Providers
        </button>
        <button 
          className={`tab-btn ${activeTab === "models" ? "active" : ""}`}
          onClick={() => setActiveTab("models")}
        >
          <Cpu size={18} />
          Models
        </button>
        <button 
          className={`tab-btn ${activeTab === "queue" ? "active" : ""}`}
          onClick={() => setActiveTab("queue")}
        >
          <Activity size={18} />
          Gateway Queue
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
        />
      )}

      {activeTab === "queue" && (
        <QueueStatsView 
          stats={queueStats} 
          loading={queueStatsLoading} 
          onRefresh={fetchQueueStats} 
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
