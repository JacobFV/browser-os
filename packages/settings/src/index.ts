export interface UserPreferences {
  theme?: string;
  language?: string;
  [key: string]: any;
}

export interface WorkspaceSettings {
  name: string;
  layout?: unknown;
  [key: string]: any;
}

export interface SystemPreferences {
  [key: string]: any;
}

class SettingsStore {
  private userPrefs: UserPreferences = {};
  private workspaceSettings: Map<string, WorkspaceSettings> = new Map();
  private systemPrefs: SystemPreferences = {};

  getUserPreferences(): UserPreferences {
    return { ...this.userPrefs };
  }

  setUserPreference(key: string, value: any): void {
    this.userPrefs[key] = value;
    this.persist();
  }

  getWorkspaceSettings(workspaceId: string): WorkspaceSettings | undefined {
    return this.workspaceSettings.get(workspaceId);
  }

  setWorkspaceSettings(workspaceId: string, settings: WorkspaceSettings): void {
    this.workspaceSettings.set(workspaceId, settings);
    this.persist();
  }

  getSystemPreferences(): SystemPreferences {
    return { ...this.systemPrefs };
  }

  setSystemPreference(key: string, value: any): void {
    this.systemPrefs[key] = value;
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem('browser-os-user-prefs', JSON.stringify(this.userPrefs));
      localStorage.setItem('browser-os-workspace-settings', JSON.stringify(Array.from(this.workspaceSettings.entries())));
      localStorage.setItem('browser-os-system-prefs', JSON.stringify(this.systemPrefs));
    } catch (error) {
      console.error('Failed to persist settings:', error);
    }
  }

  load(): void {
    try {
      const userPrefs = localStorage.getItem('browser-os-user-prefs');
      if (userPrefs) {
        this.userPrefs = JSON.parse(userPrefs);
      }
      const workspaceSettings = localStorage.getItem('browser-os-workspace-settings');
      if (workspaceSettings) {
        this.workspaceSettings = new Map(JSON.parse(workspaceSettings));
      }
      const systemPrefs = localStorage.getItem('browser-os-system-prefs');
      if (systemPrefs) {
        this.systemPrefs = JSON.parse(systemPrefs);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }
}

export const settingsStore = new SettingsStore();
settingsStore.load();

