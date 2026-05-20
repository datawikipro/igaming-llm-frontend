import React from 'react';
import { Download, AlertTriangle, RotateCw, BookOpen } from 'lucide-react';
import { UnmappedOdds } from '../hooks/useUnmappedOdds';

interface UnmappedOddsViewProps {
  unmappedOdds: UnmappedOdds[];
  loading: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export const UnmappedOddsView: React.FC<UnmappedOddsViewProps> = ({
  unmappedOdds,
  loading,
  onRefresh,
  onExport
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section className="content-section">
        <div className="section-header">
          <h2>
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
            Unmapped ODDS Types (Bet Outcomes)
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={onExport}
              disabled={unmappedOdds.length === 0}
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderColor: 'transparent' }}
            >
              <Download size={14} style={{ marginRight: '4px' }} />
              Export to MD
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading}>
              <RotateCw size={14} className={loading ? "spin" : ""} />
              {loading ? "Updating..." : "Refresh"}
            </button>
          </div>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 1.5rem 0', maxWidth: '800px' }}>
          These are betting outcomes received from crawlers (e.g. <code>leon</code>, <code>zenit</code>) that could not be mapped to standard bet codes. Use the <strong>Export to MD</strong> button to generate a structured markdown report for AI/developer ingestion to update your mapping code.
        </p>

        <div className="nodes-table-container">
          <table className="nodes-table">
            <thead>
              <tr>
                <th>Bookmaker</th>
                <th>Sport</th>
                <th>Raw Outcome Name</th>
                <th>Total Occurrences</th>
                <th>Code Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && unmappedOdds.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>
                    Fetching unmapped outcomes...
                  </td>
                </tr>
              ) : unmappedOdds.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "3rem", fontStyle: "italic" }}>
                    No unmapped odds types found! All outcomes are correctly resolved.
                  </td>
                </tr>
              ) : (
                unmappedOdds.map((item, idx) => (
                  <tr key={`${item.sourceId}-${item.sportId}-${item.rawName}-${idx}`}>
                    <td style={{ fontWeight: 700, color: "#f8fafc" }}>
                      <span className="badge-model" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        {item.sourceId}
                      </span>
                    </td>
                    <td style={{ color: "#cbd5e1" }}>
                      <span style={{ textTransform: "uppercase", fontSize: '0.85rem', fontWeight: 600, color: '#a855f7' }}>
                        {item.sportId}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: '#f1f5f9', fontSize: '0.95rem' }}>
                      "{item.rawName}"
                    </td>
                    <td style={{ fontWeight: 700, color: "#f59e0b" }}>
                      {item.count}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                        <BookOpen size={12} />
                        Requires Code Mapping
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
