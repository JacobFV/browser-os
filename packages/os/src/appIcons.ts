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
};

