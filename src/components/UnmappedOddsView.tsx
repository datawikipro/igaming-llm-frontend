import React, { useState, useMemo, useEffect } from 'react';
import { Download, AlertTriangle, RotateCw, BookOpen, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBookmaker, setSelectedBookmaker] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Extract unique bookmakers for the dropdown filter
  const bookmakers = useMemo(() => {
    const list = new Set<string>();
    unmappedOdds.forEach(item => {
      if (item.sourceId) list.add(item.sourceId);
    });
    return Array.from(list).sort();
  }, [unmappedOdds]);

  // Filter outcomes based on search query and bookmaker selection
  const filteredOdds = useMemo(() => {
    return unmappedOdds.filter(item => {
      const matchSearch = searchTerm === "" || 
        item.rawName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sportId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchBookmaker = selectedBookmaker === "all" || item.sourceId === selectedBookmaker;

      return matchSearch && matchBookmaker;
    });
  }, [unmappedOdds, searchTerm, selectedBookmaker]);

  // Reset to first page when search filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBookmaker, pageSize]);

  // Pagination calculations
  const totalItems = filteredOdds.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const paginatedOdds = useMemo(() => {
    if (pageSize === -1) return filteredOdds;
    const start = (currentPage - 1) * pageSize;
    return filteredOdds.slice(start, start + pageSize);
  }, [filteredOdds, currentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = pageSize === -1 ? totalItems : Math.min(totalItems, currentPage * pageSize);

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 4;
      }
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }
      
      if (start > 2) pages.push('...');
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) pages.push('...');
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages.map((page, idx) => {
      if (typeof page === 'string') {
        return (
          <span 
            key={`ellipsis-${idx}`} 
            style={{ 
              color: '#64748b', 
              padding: '0 4px',
              display: 'inline-flex',
              alignItems: 'center',
              fontWeight: 'bold'
            }}
          >
            {page}
          </span>
        );
      }
      return (
        <button
          key={`page-${page}`}
          onClick={() => setCurrentPage(page)}
          className={`btn btn-sm`}
          style={{
            minWidth: '34px',
            height: '34px',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: currentPage === page ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(30, 41, 59, 0.4)',
            borderColor: currentPage === page ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
            color: currentPage === page ? '#ffffff' : '#94a3b8',
            boxShadow: currentPage === page ? '0 4px 12px rgba(245, 158, 11, 0.25)' : 'none'
          }}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section className="content-section">
        {/* Header */}
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

        {/* Filter Controls */}
        <div 
          style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '12px', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.4)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '16px'
          }}
        >
          {/* Left search/select */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1, minWidth: '280px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#64748b' 
                }} 
              />
              <input
                type="text"
                placeholder="Filter by raw name or sport..."
                className="form-control sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>

            {/* Bookmaker Selector */}
            <select
              className="form-control sm"
              value={selectedBookmaker}
              onChange={e => setSelectedBookmaker(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="all">All Bookmakers</option>
              {bookmakers.map(bm => (
                <option key={bm} value={bm}>{bm}</option>
              ))}
            </select>
          </div>

          {/* Right Page Size selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Show:</span>
            <select
              className="form-control sm"
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              style={{ width: '80px' }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={-1}>All</option>
            </select>
          </div>
        </div>

        {/* Table container */}
        <div className="nodes-table-container">
          <table className="nodes-table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Bookmaker</th>
                <th style={{ width: '150px' }}>Sport</th>
                <th>Raw Outcome Name</th>
                <th style={{ width: '180px' }}>Total Occurrences</th>
                <th style={{ width: '200px' }}>Code Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && unmappedOdds.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "4rem" }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <RotateCw size={24} className="spin" style={{ color: '#f59e0b' }} />
                      <span>Fetching unmapped outcomes...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOdds.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "4rem", fontStyle: "italic" }}>
                    No unmapped odds types match your active filters.
                  </td>
                </tr>
              ) : (
                paginatedOdds.map((item, idx) => (
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
                      {item.count.toLocaleString()}
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

        {/* Pagination Footer */}
        {totalItems > 0 && pageSize !== -1 && (
          <div 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '16px 8px 8px 8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              marginTop: '12px'
            }}
          >
            {/* Status info */}
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Showing <strong style={{ color: '#cbd5e1' }}>{startIndex}</strong> to <strong style={{ color: '#cbd5e1' }}>{endIndex}</strong> of <strong style={{ color: '#f59e0b' }}>{totalItems.toLocaleString()}</strong> unmapped outcomes
              {searchTerm && <span style={{ fontStyle: 'italic' }}> (filtered from {unmappedOdds.length.toLocaleString()} total)</span>}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* First page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '34px', height: '34px', padding: 0, justifyContent: 'center', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronsLeft size={16} />
                </button>

                {/* Prev page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '34px', height: '34px', padding: 0, justifyContent: 'center', borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                <div style={{ display: 'inline-flex', gap: '4px' }}>
                  {renderPageNumbers()}
                </div>

                {/* Next page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '34px', height: '34px', padding: 0, justifyContent: 'center', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronRight size={16} />
                </button>

                {/* Last page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '34px', height: '34px', padding: 0, justifyContent: 'center', borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
