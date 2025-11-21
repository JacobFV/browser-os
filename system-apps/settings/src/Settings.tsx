import React, { useState, useEffect } from 'react';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import { SystemConfigSchema, AppRegistryEntrySchema } from '@browser-os/schemas';
import type { SystemConfig, AppRegistryEntry } from '@browser-os/schemas';
import { SettingsSidebar, type SettingsCategory } from './SettingsSidebar';
import { SystemSettings } from './SystemSettings';
import { UsersSettings } from './UsersSettings';
import { MountsSettings } from './MountsSettings';
import { AppsSettings } from './AppsSettings';
import { ChessSettings } from './ChessSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { OtherSettings } from './OtherSettings';
import { Button } from '@browser-os/ui';
import './Settings.css';

export interface SettingsProps {
  windowId: string;
}

const CONFIG_PATH = '/etc/config.json';
const REGISTRY_PATH = '/etc/registry.json';

export const Settings: React.FC<SettingsProps> = ({ windowId }) => {
  const [fs, setFs] = useState<FileSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<SettingsCategory>('system');
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [registryEntries, setRegistryEntries] = useState<AppRegistryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize filesystem
  useEffect(() => {
    const initFS = async () => {
      try {
        const filesystem = new FileSystem();
        const backend = new IndexedDBBackend({ dbName: 'browser-os-fs' });
        await backend.init();
        await filesystem.mount('/', backend);
        
        // Ensure /etc directory exists
        if (!(await filesystem.exists('/etc'))) {
          await filesystem.mkdir('/etc', { recursive: true });
        }
        
        setFs(filesystem);
        setIsInitialized(true);
      } catch (error) {
        console.error('[Settings] Failed to initialize filesystem:', error);
        setError('Failed to initialize filesystem');
      }
    };

    initFS();
  }, []);

  // Load config files when category changes
  useEffect(() => {
    if (fs && isInitialized) {
      loadConfigFiles();
    }
  }, [fs, isInitialized, currentCategory]);

  const loadConfigFiles = async () => {
    if (!fs) return;

    setLoading(true);
    setError(null);

    try {
      // Load system config
      if (await fs.exists(CONFIG_PATH)) {
        const data = await fs.read(CONFIG_PATH);
        const json = new TextDecoder().decode(data);
        const config = SystemConfigSchema.parse(JSON.parse(json));
        setSystemConfig(config);
      } else {
        // Create default config
        const defaultConfig: SystemConfig = {
          users: [
            {
              id: 'user-1',
              username: 'user',
              homeDir: '/home/user',
            },
          ],
          defaultUser: 'user-1',
          mounts: [],
          system: {
            hostname: 'browser-os',
            maxRecentFiles: 10,
          },
        };
        const data = new TextEncoder().encode(JSON.stringify(defaultConfig, null, 2));
        await fs.write(CONFIG_PATH, data);
        setSystemConfig(defaultConfig);
      }

      // Load registry
      if (await fs.exists(REGISTRY_PATH)) {
        const data = await fs.read(REGISTRY_PATH);
        const json = new TextDecoder().decode(data);
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          const entries = parsed.map((entry) => AppRegistryEntrySchema.parse(entry));
          setRegistryEntries(entries);
        }
      } else {
        setRegistryEntries([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config files');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemConfig = async (partialConfig: Partial<SystemConfig>) => {
    if (!fs || !systemConfig) return;

    try {
      const updatedConfig: SystemConfig = {
        ...systemConfig,
        ...partialConfig,
        system: {
          ...systemConfig.system,
          ...partialConfig.system,
        },
      };

      // Validate
      SystemConfigSchema.parse(updatedConfig);

      // Save
      const data = new TextEncoder().encode(JSON.stringify(updatedConfig, null, 2));
      await fs.write(CONFIG_PATH, data);
      setSystemConfig(updatedConfig);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save config');
    }
  };

  const handleSaveRegistry = async (entries: AppRegistryEntry[]) => {
    if (!fs) return;

    try {
      // Validate all entries
      entries.forEach((entry) => AppRegistryEntrySchema.parse(entry));

      // Save
      const data = new TextEncoder().encode(JSON.stringify(entries, null, 2));
      await fs.write(REGISTRY_PATH, data);
      setRegistryEntries(entries);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save registry');
    }
  };

  const handleCategoryChange = (category: SettingsCategory) => {
    setCurrentCategory(category);
  };

  if (!isInitialized || !fs) {
    return (
      <div className="settings-loading">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings">
      <SettingsSidebar currentCategory={currentCategory} onCategoryChange={handleCategoryChange} />
      <div className="settings-content">
        {error && (
          <div className="settings-error">
            {error}
            <Button size="sm" onClick={loadConfigFiles}>
              Retry
            </Button>
          </div>
        )}
        {currentCategory === 'system' && (
          <SystemSettings config={systemConfig} onSave={handleSaveSystemConfig} loading={loading} />
        )}
        {currentCategory === 'users' && (
          <UsersSettings config={systemConfig} onSave={handleSaveSystemConfig} loading={loading} />
        )}
        {currentCategory === 'mounts' && (
          <MountsSettings config={systemConfig} onSave={handleSaveSystemConfig} loading={loading} />
        )}
        {currentCategory === 'apps' && (
          <AppsSettings registryEntries={registryEntries} onSave={handleSaveRegistry} loading={loading} />
        )}
        {currentCategory === 'chess' && (
          <ChessSettings loading={loading} />
        )}
        {currentCategory === 'appearance' && (
          <AppearanceSettings loading={loading} />
        )}
        {currentCategory === 'other' && <OtherSettings fs={fs} loading={loading} />}
      </div>
    </div>
  );
};

