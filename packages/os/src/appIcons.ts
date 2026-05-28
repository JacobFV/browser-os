/**
 * Generate SVG icon data URLs for apps
 */

function createSVGIcon(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent.trim().replace(/\s+/g, ' '));
  return `data:image/svg+xml,${encoded}`;
}

export const appIcons = {
  browser: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4285F4">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#4285F4"/>
      <rect x="2" y="7" width="20" height="2" fill="#fff"/>
      <circle cx="6" cy="8" r="1" fill="#fff"/>
      <circle cx="8.5" cy="8" r="1" fill="#fff"/>
      <circle cx="11" cy="8" r="1" fill="#fff"/>
      <path d="M4 12h16M4 15h12M4 18h8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `),
  
  terminal: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00D9FF">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#1a1a1a"/>
      <path d="M6 8l4 4-4 4M12 16h6" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="#00D9FF" stroke-width="1.5"/>
    </svg>
  `),
  
  notepad: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFC107">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#FFC107"/>
      <path d="M14 2v6h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="9" y1="13" x2="15" y2="13" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="9" y1="16" x2="15" y2="16" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="9" y1="10" x2="12" y2="10" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `),
  
  'file-browser': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4CAF50">
      <rect x="2" y="3" width="20" height="18" rx="2" fill="#4CAF50"/>
      <rect x="2" y="6" width="20" height="3" fill="#fff" opacity="0.3"/>
      <rect x="4" y="11" width="16" height="1.5" fill="#fff" rx="0.5"/>
      <rect x="4" y="14" width="12" height="1.5" fill="#fff" rx="0.5"/>
      <rect x="4" y="17" width="10" height="1.5" fill="#fff" rx="0.5"/>
      <circle cx="18" cy="11.75" r="1.5" fill="#fff"/>
      <circle cx="18" cy="14.75" r="1.5" fill="#fff"/>
      <circle cx="18" cy="17.75" r="1.5" fill="#fff"/>
    </svg>
  `),
  
  settings: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9C27B0">
      <circle cx="12" cy="12" r="3" fill="#9C27B0"/>
      <path d="M12 1v4m0 6v4m11-7h-4m-6 0H3m15.364 4.364l-2.828-2.828m-4.242 0L5.636 17.364m12.728 0l-2.828-2.828m-4.242 0L5.636 6.636" 
            stroke="#9C27B0" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke="#fff" stroke-width="1"/>
    </svg>
  `),
  
  draw: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F44336">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="#F44336"/>
      <polyline points="7 10 12 15 17 10" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="12" y1="15" x2="12" y2="3" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="3" r="2" fill="#fff"/>
    </svg>
  `),

  calculator: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF9800">
      <rect x="4" y="2" width="16" height="20" rx="2" fill="#333"/>
      <rect x="6" y="4" width="12" height="4" fill="#A5D6A7"/>
      <circle cx="7" cy="11" r="1" fill="#fff"/>
      <circle cx="10" cy="11" r="1" fill="#fff"/>
      <circle cx="13" cy="11" r="1" fill="#fff"/>
      <circle cx="16" cy="11" r="1" fill="#FF9800"/>
      <circle cx="7" cy="14" r="1" fill="#fff"/>
      <circle cx="10" cy="14" r="1" fill="#fff"/>
      <circle cx="13" cy="14" r="1" fill="#fff"/>
      <circle cx="16" cy="14" r="1" fill="#FF9800"/>
      <circle cx="7" cy="17" r="1" fill="#fff"/>
      <circle cx="10" cy="17" r="1" fill="#fff"/>
      <circle cx="13" cy="17" r="1" fill="#fff"/>
      <circle cx="16" cy="17" r="1" fill="#FF9800"/>
      <rect x="6" y="19" width="13" height="1" fill="#fff"/>
    </svg>
  `),

  clock: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E91E63">
      <circle cx="12" cy="12" r="9" fill="#E91E63"/>
      <circle cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="1.5"/>
      <line x1="12" y1="12" x2="12" y2="6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="12" x2="16" y2="12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="1" fill="#fff"/>
      <line x1="12" y1="3" x2="12" y2="4" stroke="#fff" stroke-width="1.5"/>
      <line x1="12" y1="20" x2="12" y2="21" stroke="#fff" stroke-width="1.5"/>
      <line x1="3" y1="12" x2="4" y2="12" stroke="#fff" stroke-width="1.5"/>
      <line x1="20" y1="12" x2="21" y2="12" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  'system-monitor': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#607D8B">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#607D8B"/>
      <path d="M4 8h16" stroke="#fff" stroke-width="1" stroke-opacity="0.3"/>
      <path d="M4 12h16" stroke="#fff" stroke-width="1" stroke-opacity="0.3"/>
      <path d="M4 16h16" stroke="#fff" stroke-width="1" stroke-opacity="0.3"/>
      <path d="M6 12l2-3 2 6 2-4 2 3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    </svg>
  `),

  camera: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#795548">
      <rect x="4" y="6" width="16" height="14" rx="2" fill="#795548"/>
      <circle cx="12" cy="13" r="4" fill="#3E2723"/>
      <circle cx="12" cy="13" r="2" fill="#212121"/>
      <rect x="9" y="3" width="6" height="3" rx="1" fill="#795548"/>
      <circle cx="17" cy="9" r="1.5" fill="#fff" opacity="0.8"/>
      <path d="M12 11a2 2 0 0 1 2 2" stroke="#fff" stroke-width="1" fill="none" opacity="0.5"/>
    </svg>
  `),

  music: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E040FB">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#E040FB"/>
      <circle cx="12" cy="14" r="4" fill="#fff" opacity="0.2"/>
      <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" fill="#fff"/>
      <path d="M14 14V8h2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>
  `),

  calendar: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1976D2">
      <rect x="3" y="4" width="18" height="18" rx="2" fill="#1976D2"/>
      <rect x="3" y="7" width="18" height="2" fill="#fff" opacity="0.3"/>
      <circle cx="7" cy="12" r="1" fill="#fff"/>
      <circle cx="12" cy="12" r="1" fill="#fff"/>
      <circle cx="17" cy="12" r="1" fill="#fff"/>
      <circle cx="7" cy="16" r="1" fill="#fff"/>
      <circle cx="12" cy="16" r="1" fill="#fff"/>
      <line x1="3" y1="9" x2="21" y2="9" stroke="#fff" stroke-width="1"/>
      <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  'image-viewer': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00BCD4">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#00BCD4"/>
      <circle cx="8" cy="8" r="2" fill="#fff"/>
      <path d="M3 18l5-5 4 4 6-6 3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  'video-player': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D32F2F">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#D32F2F"/>
      <polygon points="10 8 10 16 16 12" fill="#fff"/>
      <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  contacts: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#009688">
      <circle cx="12" cy="8" r="4" fill="#009688"/>
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" fill="#009688"/>
      <circle cx="18" cy="6" r="2" fill="#fff" opacity="0.8"/>
      <path d="M20 12v2a2 2 0 0 1-2 2h-2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.8"/>
    </svg>
  `),

  weather: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFA726">
      <circle cx="12" cy="12" r="8" fill="#FFA726"/>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="3" fill="#fff" opacity="0.3"/>
      <path d="M8 8l2 2M16 8l-2 2M8 16l2-2M16 16l-2-2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `),

  games: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#673AB7">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#673AB7"/>
      <circle cx="8" cy="8" r="2" fill="#fff"/>
      <circle cx="16" cy="8" r="2" fill="#fff"/>
      <circle cx="8" cy="16" r="2" fill="#fff"/>
      <circle cx="16" cy="16" r="2" fill="#fff"/>
      <circle cx="12" cy="12" r="3" fill="#fff" opacity="0.3"/>
      <path d="M12 9v6M9 12h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),

  screenshot: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9E9E9E">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#9E9E9E"/>
      <circle cx="12" cy="12" r="4" fill="#fff" opacity="0.2"/>
      <circle cx="12" cy="12" r="2" fill="#fff"/>
      <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
      <path d="M8 2h8v2H8z" fill="#fff"/>
      <path d="M18 6h2v2h-2z" fill="#fff"/>
    </svg>
  `),

  'voice-recorder': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E91E63">
      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="#E91E63"/>
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>
      <line x1="12" y1="18" x2="12" y2="22" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="22" x2="16" y2="22" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="2" r="1.5" fill="#fff"/>
    </svg>
  `),

  notes: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFC107">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#FFC107"/>
      <line x1="7" y1="8" x2="17" y2="8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="7" y1="12" x2="17" y2="12" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="7" y1="16" x2="14" y2="16" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="18" cy="6" r="2" fill="#fff" opacity="0.8"/>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  todo: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#667eea">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#667eea"/>
      <circle cx="7" cy="9" r="1.5" fill="#fff" opacity="0.8"/>
      <line x1="10" y1="9" x2="17" y2="9" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="7" cy="12" r="1.5" fill="#fff" opacity="0.8"/>
      <line x1="10" y1="12" x2="17" y2="12" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="7" cy="15" r="1.5" fill="#fff" opacity="0.8"/>
      <line x1="10" y1="15" x2="14" y2="15" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M6 9l1 1 2-2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  'file-search': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4CAF50">
      <circle cx="11" cy="11" r="7" fill="#4CAF50"/>
      <path d="M16 16l4 4" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>
      <rect x="2" y="4" width="8" height="10" rx="1" fill="#fff" opacity="0.3"/>
      <line x1="4" y1="7" x2="8" y2="7" stroke="#fff" stroke-width="1" stroke-linecap="round"/>
      <line x1="4" y1="10" x2="7" y2="10" stroke="#fff" stroke-width="1" stroke-linecap="round"/>
    </svg>
  `),

  'markdown-editor': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2196F3">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#2196F3"/>
      <line x1="7" y1="7" x2="17" y2="7" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="7" y1="11" x2="17" y2="11" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="7" y1="15" x2="14" y2="15" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M17 9l-2 2-2-2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  'password-manager': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9C27B0">
      <rect x="4" y="6" width="16" height="14" rx="2" fill="#9C27B0"/>
      <circle cx="12" cy="13" r="3" fill="#fff" opacity="0.3"/>
      <path d="M12 10v6M10 12h4" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <rect x="7" y="2" width="10" height="4" rx="1" fill="#9C27B0"/>
      <rect x="4" y="6" width="16" height="14" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  'pdf-viewer': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC143C">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#DC143C"/>
      <path d="M7 7h10M7 11h10M7 15h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="16" cy="16" r="2" fill="#fff" opacity="0.8"/>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  'process-manager': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF5722">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#FF5722"/>
      <rect x="5" y="6" width="14" height="2" rx="0.5" fill="#fff"/>
      <rect x="5" y="10" width="12" height="2" rx="0.5" fill="#fff"/>
      <rect x="5" y="14" width="10" height="2" rx="0.5" fill="#fff"/>
      <circle cx="18" cy="7" r="1.5" fill="#fff"/>
      <circle cx="18" cy="11" r="1.5" fill="#fff"/>
      <circle cx="18" cy="15" r="1.5" fill="#fff"/>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  chess: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#795548">
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#795548"/>
      <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
      <rect x="3" y="3" width="2.5" height="2.5" fill="#fff" opacity="0.3"/>
      <rect x="8.5" y="3" width="2.5" height="2.5" fill="#fff" opacity="0.3"/>
      <rect x="14" y="3" width="2.5" height="2.5" fill="#fff" opacity="0.3"/>
      <rect x="19.5" y="3" width="2.5" height="2.5" fill="#fff" opacity="0.3"/>
      <rect x="5.75" y="5.75" width="2.5" height="2.5" fill="#fff" opacity="0.3"/>
      <rect x="11.25" y="5.75" width="2.5" height="2.5" fill="#fff" opacity="0.3"/>
      <rect x="16.75" y="5.75" width="2.5" height="2.5" fill="#fff" opacity="0.3"/>
      <circle cx="4.25" cy="4.25" r="1" fill="#fff"/>
      <circle cx="9.75" cy="4.25" r="1" fill="#fff"/>
      <circle cx="15.25" cy="4.25" r="1" fill="#fff"/>
      <circle cx="20.75" cy="4.25" r="1" fill="#fff"/>
      <circle cx="7" cy="7" r="0.8" fill="#fff"/>
      <circle cx="12.5" cy="7" r="0.8" fill="#fff"/>
      <circle cx="18" cy="7" r="0.8" fill="#fff"/>
    </svg>
  `),

  'messaging-client': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00BCD4">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#00BCD4"/>
      <path d="M6 8h12M6 12h10M6 16h8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="18" cy="7" r="2" fill="#fff"/>
      <path d="M17 7l1 1 2-2" stroke="#00BCD4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
    </svg>
  `),

  'email-client': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF9800">
      <rect x="3" y="4" width="18" height="16" rx="2" fill="#FF9800"/>
      <path d="M3 7l9 6 9-6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/>
      <circle cx="18" cy="6" r="1.5" fill="#fff" opacity="0.8"/>
    </svg>
  `),

  snake: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4CAF50">
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#4CAF50"/>
      <circle cx="7" cy="7" r="2" fill="#fff"/>
      <circle cx="12" cy="7" r="2" fill="#fff"/>
      <circle cx="17" cy="7" r="2" fill="#fff"/>
      <circle cx="7" cy="12" r="2" fill="#fff"/>
      <circle cx="12" cy="12" r="2" fill="#fff"/>
      <circle cx="17" cy="12" r="2" fill="#fff"/>
      <circle cx="7" cy="17" r="2" fill="#fff"/>
      <circle cx="12" cy="17" r="2" fill="#fff"/>
      <circle cx="17" cy="17" r="2" fill="#fff"/>
      <circle cx="12" cy="12" r="1" fill="#4CAF50"/>
    </svg>
  `),

  minesweeper: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF9800">
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#FF9800"/>
      <rect x="4" y="4" width="3" height="3" fill="#fff" opacity="0.8"/>
      <rect x="9" y="4" width="3" height="3" fill="#fff" opacity="0.8"/>
      <rect x="14" y="4" width="3" height="3" fill="#fff" opacity="0.8"/>
      <rect x="19" y="4" width="3" height="3" fill="#fff" opacity="0.8"/>
      <rect x="4" y="9" width="3" height="3" fill="#fff" opacity="0.8"/>
      <rect x="9" y="9" width="3" height="3" fill="#fff" opacity="0.8"/>
      <rect x="14" y="9" width="3" height="3" fill="#fff" opacity="0.8"/>
      <rect x="19" y="9" width="3" height="3" fill="#fff" opacity="0.8"/>
      <circle cx="5.5" cy="5.5" r="1" fill="#FF9800"/>
      <circle cx="10.5" cy="5.5" r="1" fill="#FF9800"/>
      <circle cx="15.5" cy="5.5" r="1" fill="#FF9800"/>
      <circle cx="20.5" cy="5.5" r="1" fill="#FF9800"/>
    </svg>
  `),

  tetris: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#00BCD4">
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#00BCD4"/>
      <rect x="4" y="4" width="4" height="4" fill="#fff"/>
      <rect x="10" y="4" width="4" height="4" fill="#fff"/>
      <rect x="16" y="4" width="4" height="4" fill="#fff"/>
      <rect x="4" y="10" width="4" height="4" fill="#fff"/>
      <rect x="10" y="10" width="4" height="4" fill="#fff"/>
      <rect x="16" y="10" width="4" height="4" fill="#fff"/>
      <rect x="4" y="16" width="4" height="4" fill="#fff"/>
      <rect x="10" y="16" width="4" height="4" fill="#fff"/>
      <rect x="16" y="16" width="4" height="4" fill="#fff"/>
    </svg>
  `),

  'tic-tac-toe': createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9C27B0">
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#9C27B0"/>
      <line x1="8" y1="4" x2="8" y2="22" stroke="#fff" stroke-width="2"/>
      <line x1="16" y1="4" x2="16" y2="22" stroke="#fff" stroke-width="2"/>
      <line x1="2" y1="8" x2="22" y2="8" stroke="#fff" stroke-width="2"/>
      <line x1="2" y1="16" x2="22" y2="16" stroke="#fff" stroke-width="2"/>
      <circle cx="5" cy="5" r="1.5" fill="#fff"/>
      <path d="M19 19l-2-2M17 19l2-2" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),

  sheets: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0F9D58">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#0F9D58"/>
      <path d="M14 2v6h6" fill="#0a7c46"/>
      <rect x="7" y="11" width="10" height="8" fill="#fff"/>
      <line x1="7" y1="14" x2="17" y2="14" stroke="#0F9D58" stroke-width="1"/>
      <line x1="7" y1="16.5" x2="17" y2="16.5" stroke="#0F9D58" stroke-width="1"/>
      <line x1="10.5" y1="11" x2="10.5" y2="19" stroke="#0F9D58" stroke-width="1"/>
      <line x1="13.5" y1="11" x2="13.5" y2="19" stroke="#0F9D58" stroke-width="1"/>
    </svg>
  `),

  slides: createSVGIcon(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FBBC04">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#FBBC04"/>
      <path d="M14 2v6h6" fill="#e6a800"/>
      <rect x="7" y="11" width="10" height="7" rx="1" fill="#fff"/>
    </svg>
  `),
};
