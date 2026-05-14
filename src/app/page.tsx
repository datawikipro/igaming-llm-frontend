"use client";

import React, { useState, useEffect } from "react";
import { Plus, RotateCw, LayoutDashboard, Database, Cpu } from "lucide-react";
import { useLlmApi } from "../hooks/useLlmApi";
import { StatsGrid } from "../components/StatsGrid";
import { NodesTable } from "../components/NodesTable";
import { RegisterNodeModal } from "../components/RegisterNodeModal";
import { ProvidersTable } from "../components/ProvidersTable";
import { ModelsTable } from "../components/ModelsTable";

type TabType = "nodes" | "providers" | "models";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("nodes");
  const [showModal, setShowModal] = useState(false);
  
  const {
    nodes,
    providers,
    models,
    loading,
    refreshing,
    fetchNodes,
    fetchProviders,
    fetchModels,
    handleRefresh,
    createNode,
    deleteNode,
    resetNode,
    saveProvider,
    deleteProvider,
    saveModel,
    deleteModel
  } = useLlmApi();

  useEffect(() => {
    fetchNodes();
    fetchProviders();
    fetchModels();
    
    // Poll nodes status every 10 seconds
    const interval = setInterval(fetchNodes, 10000);
    return () => clearInterval(interval);
  }, [fetchNodes, fetchProviders, fetchModels]);

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
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            {activeTab === "nodes" ? "Add Lease" : activeTab === "providers" ? "Add Provider" : "Add Model"}
          </button>
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
          loading={loading} 
          onSave={saveProvider} 
          onDelete={deleteProvider} 
        />
      )}

      {activeTab === "models" && (
        <ModelsTable 
          models={models} 
          providers={providers}
          loading={loading} 
          onSave={saveModel} 
          onDelete={deleteModel} 
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
