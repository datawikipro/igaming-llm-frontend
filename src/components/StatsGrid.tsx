import React from 'react';
import { Cpu, CheckCircle, Coins, AlertTriangle } from 'lucide-react';
import { LlmGatewayNode } from '../types';

interface StatsGridProps {
  nodes: LlmGatewayNode[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ nodes }) => {
  const totalNodes = nodes.length;
  const healthyNodes = nodes.filter(n => n.status === "HEALTHY").length;
  const exhaustedNodes = nodes.filter(n => n.status === "EXHAUSTED").length;
  
  const totalSuccess = nodes.reduce((sum, n) => sum + n.successCount, 0);
  const totalFailures = nodes.reduce((sum, n) => sum + n.failureCount, 0);
  const totalTokens = nodes.reduce((sum, n) => sum + n.totalTokensUsed, 0);

  const successRate = totalSuccess + totalFailures > 0 
    ? ((totalSuccess / (totalSuccess + totalFailures)) * 100).toFixed(1)
    : "100";

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-title">Active Gateways</span>
          <span className="stat-value">{healthyNodes} / {totalNodes}</span>
        </div>
        <div className="stat-icon purple">
          <Cpu size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-title">Success Rate</span>
          <span className="stat-value">{successRate}%</span>
        </div>
        <div className="stat-icon green">
          <CheckCircle size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-title">Total Tokens</span>
          <span className="stat-value">{totalTokens.toLocaleString()}</span>
        </div>
        <div className="stat-icon blue">
          <Coins size={24} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-info">
          <span className="stat-title">Exhausted (429)</span>
          <span className="stat-value">{exhaustedNodes}</span>
        </div>
        <div className="stat-icon red">
          <AlertTriangle size={24} />
        </div>
      </div>
    </section>
  );
};
