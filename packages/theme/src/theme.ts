export type ThemeSkin = 'win95' | 'macos' | 'monaco' | 'glass';

export interface ThemeTokens {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  border: string;
  radius: string;
  elevation: string;
  shadow: string;
}

export interface Theme {
  skin: ThemeSkin;
  tokens: ThemeTokens;
  accent?: string;
}

export const themes: Record<ThemeSkin, ThemeTokens> = {
  win95: {
    bg: '#c0c0c0',
    fg: '#000000',
    muted: '#808080',
    accent: '#000080',
    border: '#000000',
    radius: '0px',
    elevation: 'inset',
    shadow: '2px 2px 0px rgba(0,0,0,0.5)',
  },
  macos: {
    bg: '#f5f5f7',
    fg: '#1d1d1f',
    muted: '#86868b',
    accent: '#0071e3',
    border: 'rgba(0,0,0,0.1)',
    radius: '10px',
    elevation: 'blur',
    shadow: '0 4px 16px rgba(0,0,0,0.1)',
  },
  monaco: {
    bg: '#1e1e1e',
    fg: '#cccccc',
    muted: '#858585',
    accent: '#007acc',
    border: '#3e3e3e',
    radius: '0px',
    elevation: 'flat',
    shadow: 'none',
  },
  glass: {
    bg: 'rgba(255,255,255,0.1)',
    fg: '#ffffff',
    muted: 'rgba(255,255,255,0.6)',
    accent: '#00d4ff',
    border: 'rgba(255,255,255,0.2)',
    radius: '16px',
    elevation: 'backdrop-blur',
    shadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
};

export function applyTheme(skin: ThemeSkin, accent?: string): void {
  const tokens = themes[skin];
  const root = document.documentElement;
  
  root.style.setProperty('--os-bg', tokens.bg);
  root.style.setProperty('--os-fg', tokens.fg);
  root.style.setProperty('--os-muted', tokens.muted);
  root.style.setProperty('--os-accent', accent || tokens.accent);
  root.style.setProperty('--os-border', tokens.border);
  root.style.setProperty('--os-radius', tokens.radius);
  root.style.setProperty('--os-elevation', tokens.elevation);
  root.style.setProperty('--os-shadow', tokens.shadow);
  
  root.setAttribute('data-theme', skin);
}

export function getTheme(): ThemeSkin {
  return (document.documentElement.getAttribute('data-theme') as ThemeSkin) || 'win95';
}

