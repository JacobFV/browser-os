import React, { useState, useEffect, useRef } from 'react';
import { File, ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight, X, List, FileText } from 'lucide-react';
import './PDFViewer.css';

// Default content for the empty state — keeps the viewer from looking blank
// when a SynthUX agent runs `pdf.open_pdf` without uploading a real file.
const SAMPLE_PAGES: { title: string; body: string[] }[] = [
  {
    title: 'Q3 Research Brief — ACME',
    body: [
      'Prepared by Diana Reyes, Research Engineering',
      '',
      'Executive Summary',
      'The Q3 quarter brought a meaningful shift in revenue mix. Segment-B share rose 4.1 percentage points month-over-month, driven primarily by mid-market accounts. Churn on the 90-day cohort fell 0.8 pp. The standout open risk is vendor concentration in the EU: 67% of supply now sits with two providers covering 92% of volume.',
      '',
      'Methods',
      'Weekly cohort pulls from the analytics warehouse were triangulated against five 45-minute supplier interviews and a macro indicator snapshot from FRED and ECB. Each signal was confirmed against at least two independent sources before inclusion.',
      '',
      'Findings',
      '1.  Segment-B share +4.1pp month-over-month, concentrated in mid-market.',
      '2.  Cohort churn down 0.8pp, gated by enterprise renewals in week 6.',
      '3.  Three of five suppliers signalled a 6% raise in Q1.',
      '4.  CPI vs cart conversion correlation: −0.42 over 18 months.',
    ],
  },
  {
    title: 'Q3 Research Brief — ACME (cont.)',
    body: [
      'Risks',
      'EU vendor concentration is the load-bearing risk. Price-floor renegotiation collides with the Q1 renewal window. Segment-B growth depends on a launch we have not yet committed to.',
      '',
      'Recommendations',
      '•  Lock two backup EU vendors before Q1.',
      '•  Freeze the cohort dashboard schema.',
      '•  Brief execs in week 2 with the supplier matrix.',
      '•  Stand up a macro-hedge feasibility study by mid-February.',
      '',
      'Appendix A — Data sources',
      'Analytics warehouse, supplier interviews, macro indicator basket, customer support escalation log. Window: 2026-01-01 to 2026-Q3-end.',
      '',
      'Appendix B — Glossary',
      'MoM = month over month. pp = percentage points. CPI = consumer price index. Cohort = customer group bucketed by sign-up week.',
    ],
  },
];

const SamplePdfPages: React.FC = () => (
  <div className="pdf-pages" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', gap: '20px' }}>
    {SAMPLE_PAGES.map((p, idx) => (
      <div
        key={idx}
        className="pdf-page"
        style={{
          width: '720px',
          maxWidth: '95%',
          background: 'white',
          color: '#1d1d1f',
          padding: '64px 72px',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)',
          borderRadius: '4px',
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 1.55,
        }}
      >
        <h1 style={{ fontSize: '20px', borderBottom: '1px solid #c8c8c8', paddingBottom: '8px', marginBottom: '18px' }}>
          {p.title}
        </h1>
        {p.body.map((line, i) =>
          line === '' ? (
            <div key={i} style={{ height: '10px' }} />
          ) : /^[A-Z][a-z A-Z]+$/.test(line) && line.length < 60 ? (
            <h2 key={i} style={{ fontSize: '15px', marginTop: '16px', marginBottom: '6px' }}>{line}</h2>
          ) : (
            <p key={i} style={{ fontSize: '13px', margin: '4px 0' }}>{line}</p>
          )
        )}
        <div style={{ marginTop: '36px', fontSize: '11px', color: '#666', textAlign: 'center' }}>
          — page {idx + 1} of {SAMPLE_PAGES.length} —
        </div>
      </div>
    ))}
  </div>
);

type ViewMode = 'single' | 'continuous';

export const PDFViewer: React.FC<{ os: any }> = ({ os }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  // Default to the sample-document page count so the indicator shows "1 / N"
  // (not "1 / 0") before any real PDF is loaded; loadPDF() overrides it.
  const [totalPages, setTotalPages] = useState(SAMPLE_PAGES.length);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<ViewMode>('continuous');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pdfUrl) {
      loadPDF();
    }
  }, [pdfUrl]);

  const loadPDF = async () => {
    if (!pdfUrl) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, you'd use a PDF library like pdf.js
      // For now, we'll use an iframe/embed approach
      // Note: This is a simplified implementation
      const iframe = document.createElement('iframe');
      iframe.src = pdfUrl;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      // Simulate page count (in real implementation, parse PDF)
      setTotalPages(10); // Mock value
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setIsLoading(false);
    }
  };

  const openFile = async (filePath?: string) => {
    if (!filePath && os?.fs) {
      // Prompt for file path
      const path = prompt('Enter PDF file path:', '/home/user/Documents/');
      if (!path) return;
      filePath = path;
    }

    if (filePath && os?.fs) {
      try {
        const data = await os.fs.read(filePath);
        // Create blob URL from data
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error reading file:', err);
        alert('Failed to load PDF file');
      }
    } else {
      // Fallback: use file input
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setCurrentPage(1);
    } else {
      alert('Please select a PDF file');
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to page in continuous mode
      if (viewMode === 'continuous' && containerRef.current) {
        const pageElement = containerRef.current.querySelector(`[data-page="${page}"]`);
        pageElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const generateThumbnails = () => {
    // In a real implementation, generate thumbnails from PDF pages
    // For now, create placeholder thumbnails
    const thumbnails: string[] = [];
    for (let i = 0; i < totalPages; i++) {
      thumbnails.push(`data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
          <rect width="200" height="280" fill="white"/>
          <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="24" fill="#999">
            Page ${i + 1}
          </text>
        </svg>
      `)}`);
    }
    setPageThumbnails(thumbnails);
  };

  useEffect(() => {
    if (totalPages > 0) {
      generateThumbnails();
    }
  }, [totalPages]);

  const renderPDF = () => {
    if (!pdfUrl) return null;

    if (viewMode === 'single') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <iframe
            src={`${pdfUrl}#page=${currentPage}`}
            style={{
              width: `${zoom}%`,
              height: '100%',
              border: 'none',
              maxWidth: '100%',
            }}
            title="PDF Viewer"
          />
        </div>
      );
    } else {
      // Continuous mode - show all pages
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
          <iframe
            src={pdfUrl}
            style={{
              width: `${zoom}%`,
              height: '800px',
              border: 'none',
              maxWidth: '100%',
            }}
            title="PDF Viewer"
          />
        </div>
      );
    }
  };

  return (
    <div className="pdf-viewer-app">
      <div className="pdf-viewer-header">
        <div className="pdf-viewer-title">
          <FileText size={16} />
          <span className="pdf-viewer-title-text">
            {pdfUrl ? `PDF Viewer - Page ${currentPage} of ${totalPages}` : 'PDF Viewer'}
          </span>
        </div>
        <div className="pdf-viewer-toolbar">
          <button className="toolbar-btn" onClick={() => openFile()} title="Open File">
            <File size={16} />
          </button>
          <div className="toolbar-separator" />
          <button
            className="toolbar-btn"
            onClick={() => setShowSidebar(!showSidebar)}
            title="Toggle Sidebar"
          >
            <List size={16} />
          </button>
          <div className="toolbar-separator" />
          <div className="view-mode-selector">
            <button
              className={`view-mode-btn ${viewMode === 'single' ? 'active' : ''}`}
              onClick={() => setViewMode('single')}
              title="Single Page"
            >
              Single
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'continuous' ? 'active' : ''}`}
              onClick={() => setViewMode('continuous')}
              title="Continuous"
            >
              Continuous
            </button>
          </div>
          <div className="toolbar-separator" />
          <div className="page-controls">
            <button
              className="toolbar-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            <input
              type="number"
              className="page-input"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              min={1}
              max={totalPages}
            />
            <span className="page-info">/ {totalPages}</span>
            <button
              className="toolbar-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="toolbar-separator" />
          <div className="zoom-controls">
            <button className="toolbar-btn" onClick={zoomOut} disabled={zoom <= 50} title="Zoom Out">
              <ZoomOut size={16} />
            </button>
            <span className="zoom-value">{zoom}%</span>
            <button className="toolbar-btn" onClick={zoomIn} disabled={zoom >= 200} title="Zoom In">
              <ZoomIn size={16} />
            </button>
            <button className="toolbar-btn" onClick={resetZoom} title="Reset Zoom">
              <FileText size={16} />
            </button>
          </div>
          <div className="toolbar-separator" />
          <button className="toolbar-btn" onClick={toggleFullscreen} title="Fullscreen">
            <Maximize size={16} />
          </button>
        </div>
      </div>

      <div className="pdf-viewer-content">
        {showSidebar && (
          <div className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title">Pages</div>
              <button className="toolbar-btn" onClick={() => setShowSidebar(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="thumbnail-list">
              {pageThumbnails.map((thumbnail, index) => (
                <div
                  key={index}
                  className={`thumbnail-item ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => goToPage(index + 1)}
                >
                  <div className="thumbnail-page-number">Page {index + 1}</div>
                  <img src={thumbnail} alt={`Page ${index + 1}`} className="thumbnail-image" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pdf-container" ref={containerRef}>
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <div className="loading-text">Loading PDF...</div>
            </div>
          ) : pdfUrl ? (
            renderPDF()
          ) : (
            <SamplePdfPages />
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="file-input"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
      />
    </div>
  );
};

