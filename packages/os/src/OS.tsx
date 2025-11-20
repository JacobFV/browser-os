import React, { useEffect, useState } from 'react';
import { EventBus } from '@browser-os/events';
import { FileSystem, IndexedDBBackend } from '@browser-os/fs';
import { AppRegistry } from '@browser-os/app-registry';
import { WindowManager } from '@browser-os/windowing';
import { WorkspaceManager, Workspace, useWorkspace, useKeyboardShortcuts } from '@browser-os/workspace';
import { Taskbar } from '@browser-os/taskbar';
import type { Window } from '@browser-os/schemas';
import { AppComponentRegistry } from './AppComponentRegistry';
import { Browser } from '@browser-os/browser';
import { Terminal } from '@browser-os/terminal';
import { Notepad } from '@browser-os/notepad';
import { FileBrowser } from '@browser-os/file-browser';
import { Settings } from '@browser-os/settings';
import { Draw } from '@browser-os/draw';
import { Calculator } from '@browser-os/calculator';
import { Clock } from '@browser-os/clock';
import { SystemMonitor } from '@browser-os/system-monitor';
import { Camera } from '@browser-os/camera';
import { MusicPlayer } from '@browser-os/music';
import { Calendar } from '@browser-os/calendar';
import { ImageViewer } from '@browser-os/image-viewer';
import { VideoPlayer } from '@browser-os/video-player';
import { Contacts } from '@browser-os/contacts';
import { Weather } from '@browser-os/weather';
import { Games } from '@browser-os/games';
import { Screenshot } from '@browser-os/screenshot';
import { VoiceRecorder } from '@browser-os/voice-recorder';
import { Notes } from '@browser-os/notes';
import { Todo } from '@browser-os/todo';
import { FileSearch } from '@browser-os/file-search';
import { MarkdownEditor } from '@browser-os/markdown-editor';
import { PasswordManager } from '@browser-os/password-manager';
import { PDFViewer } from '@browser-os/pdf-viewer';
import { Desktop } from './Desktop';
import { NotificationManager } from '@browser-os/notifications';
import { appIcons } from './appIcons';
import './OS.css';

export interface OSProps {
  /** Custom desktop background component */
  desktop?: React.ReactNode;
  /** Number of workspaces to create (default: 4) */
  workspaceCount?: number;
  /** Filesystem database name (default: 'browser-os-fs') */
  dbName?: string;
}

export const OS: React.FC<OSProps> = ({ desktop, workspaceCount = 4, dbName = 'browser-os-fs' }) => {
  const [eventBus] = useState(() => new EventBus());
  const [fs] = useState(() => new FileSystem());
  const [appRegistry] = useState(() => new AppRegistry({ fs, eventBus }));
  const [windowManager] = useState(() => new WindowManager({ eventBus }));
  const [appComponentRegistry] = useState(() => new AppComponentRegistry(eventBus));
  const [workspaceManager, setWorkspaceManager] = useState<WorkspaceManager | null>(null);
  const [notificationManager] = useState(() => new NotificationManager({ eventBus }));
  const [initialized, setInitialized] = useState(false);

  // Initialize filesystem and app registry
  useEffect(() => {
    const init = async () => {
      try {
        console.log('[OS] Starting initialization...');
        
        // Initialize filesystem with IndexedDB backend
        console.log('[OS] Initializing IndexedDB backend...');
        const backend = new IndexedDBBackend({ dbName });
        await backend.init();
        console.log('[OS] IndexedDB backend initialized');
        
        await fs.mount('/', backend);
        console.log('[OS] Filesystem mounted');

        // Initialize app registry
        console.log('[OS] Initializing app registry...');
        await appRegistry.init();
        console.log('[OS] App registry initialized');

        // Register browser app component
        console.log('[OS] Registering browser app component...');
        console.log('[OS] Browser component:', Browser);
        if (!Browser) {
          throw new Error('Browser component is undefined');
        }
        appComponentRegistry.registerAppComponent('browser', Browser);
        console.log('[OS] Browser app component registered');

        // Register or update browser app in registry
        const existingBrowser = appRegistry.get('browser');
        if (!existingBrowser || !existingBrowser.manifest.icon) {
          console.log('[OS] Registering/updating browser app in registry...');
          const browserEntry = {
            id: 'browser',
            installedAt: existingBrowser?.installedAt || Date.now(),
            installedBy: existingBrowser?.installedBy || 'system',
            enabled: existingBrowser?.enabled ?? true,
            manifest: {
              id: 'browser',
              name: 'Browser',
              version: '0.1.0',
              description: 'Web browser',
              entrypoint: '/bin/browser.js',
              permissions: [],
              icon: appIcons.browser,
              showInTaskbar: true,
            },
          };
          appRegistry.add(browserEntry);
          await appRegistry.save();
          console.log('[OS] Browser app registered/updated in registry');
        }

        // Register terminal app component
        console.log('[OS] Registering terminal app component...');
        console.log('[OS] Terminal component:', Terminal);
        if (!Terminal) {
          throw new Error('Terminal component is undefined');
        }
        appComponentRegistry.registerAppComponent('terminal', Terminal);
        console.log('[OS] Terminal app component registered');

        // Register or update terminal app in registry
        const existingTerminal = appRegistry.get('terminal');
        if (!existingTerminal || !existingTerminal.manifest.icon) {
          console.log('[OS] Registering/updating terminal app in registry...');
          const terminalEntry = {
            id: 'terminal',
            installedAt: existingTerminal?.installedAt || Date.now(),
            installedBy: existingTerminal?.installedBy || 'system',
            enabled: existingTerminal?.enabled ?? true,
            manifest: {
              id: 'terminal',
              name: 'Terminal',
              version: '0.1.0',
              description: 'Terminal emulator',
              entrypoint: '/bin/terminal.js',
              permissions: [],
              icon: appIcons.terminal,
              showInTaskbar: true,
            },
          };
          appRegistry.add(terminalEntry);
          await appRegistry.save();
          console.log('[OS] Terminal app registered/updated in registry');
        }

        // Register notepad app component
        console.log('[OS] Registering notepad app component...');
        console.log('[OS] Notepad component:', Notepad);
        if (!Notepad) {
          throw new Error('Notepad component is undefined');
        }
        appComponentRegistry.registerAppComponent('notepad', Notepad);
        console.log('[OS] Notepad app component registered');

        // Register or update notepad app in registry
        const existingNotepad = appRegistry.get('notepad');
        if (!existingNotepad || !existingNotepad.manifest.icon) {
          console.log('[OS] Registering/updating notepad app in registry...');
          const notepadEntry = {
            id: 'notepad',
            installedAt: existingNotepad?.installedAt || Date.now(),
            installedBy: existingNotepad?.installedBy || 'system',
            enabled: existingNotepad?.enabled ?? true,
            manifest: {
              id: 'notepad',
              name: 'Notepad',
              version: '0.1.0',
              description: 'Text editor',
              entrypoint: '/bin/notepad.js',
              permissions: [],
              icon: appIcons.notepad,
              showInTaskbar: true,
            },
          };
          appRegistry.add(notepadEntry);
          await appRegistry.save();
          console.log('[OS] Notepad app registered/updated in registry');
        }

        // Register file browser app component
        console.log('[OS] Registering file browser app component...');
        console.log('[OS] FileBrowser component:', FileBrowser);
        if (!FileBrowser) {
          throw new Error('FileBrowser component is undefined');
        }
        appComponentRegistry.registerAppComponent('file-browser', FileBrowser);
        console.log('[OS] FileBrowser app component registered');

        // Register or update file browser app in registry
        const existingFileBrowser = appRegistry.get('file-browser');
        if (!existingFileBrowser || !existingFileBrowser.manifest.icon) {
          console.log('[OS] Registering/updating file browser app in registry...');
          const fileBrowserEntry = {
            id: 'file-browser',
            installedAt: existingFileBrowser?.installedAt || Date.now(),
            installedBy: existingFileBrowser?.installedBy || 'system',
            enabled: existingFileBrowser?.enabled ?? true,
            manifest: {
              id: 'file-browser',
              name: 'File Browser',
              version: '0.1.0',
              description: 'File browser',
              entrypoint: '/bin/file-browser.js',
              permissions: [],
              icon: appIcons['file-browser'],
              showInTaskbar: true,
            },
          };
          appRegistry.add(fileBrowserEntry);
          await appRegistry.save();
          console.log('[OS] FileBrowser app registered/updated in registry');
        }

        // Register settings app component
        console.log('[OS] Registering settings app component...');
        console.log('[OS] Settings component:', Settings);
        if (!Settings) {
          throw new Error('Settings component is undefined');
        }
        appComponentRegistry.registerAppComponent('settings', Settings);
        console.log('[OS] Settings app component registered');

        // Register or update settings app in registry
        const existingSettings = appRegistry.get('settings');
        if (!existingSettings || !existingSettings.manifest.icon) {
          console.log('[OS] Registering/updating settings app in registry...');
          const settingsEntry = {
            id: 'settings',
            installedAt: existingSettings?.installedAt || Date.now(),
            installedBy: existingSettings?.installedBy || 'system',
            enabled: existingSettings?.enabled ?? true,
            manifest: {
              id: 'settings',
              name: 'Settings',
              version: '0.1.0',
              description: 'System settings',
              entrypoint: '/bin/settings.js',
              permissions: [],
              icon: appIcons.settings,
              showInTaskbar: true,
            },
          };
          appRegistry.add(settingsEntry);
          await appRegistry.save();
          console.log('[OS] Settings app registered/updated in registry');
        }

        // Register draw app component
        console.log('[OS] Registering draw app component...');
        console.log('[OS] Draw component:', Draw);
        if (!Draw) {
          throw new Error('Draw component is undefined');
        }
        appComponentRegistry.registerAppComponent('draw', Draw);
        console.log('[OS] Draw app component registered');

        // Register or update draw app in registry
        const existingDraw = appRegistry.get('draw');
        if (!existingDraw || !existingDraw.manifest.icon) {
          console.log('[OS] Registering/updating draw app in registry...');
          const drawEntry = {
            id: 'draw',
            installedAt: existingDraw?.installedAt || Date.now(),
            installedBy: existingDraw?.installedBy || 'system',
            enabled: existingDraw?.enabled ?? true,
            manifest: {
              id: 'draw',
              name: 'Draw',
              version: '0.1.0',
              description: 'Drawing app',
              entrypoint: '/bin/draw.js',
              permissions: [],
              icon: appIcons.draw,
              showInTaskbar: true,
            },
          };
          appRegistry.add(drawEntry);
          await appRegistry.save();
          console.log('[OS] Draw app registered/updated in registry');
        }

        // Register calculator app component
        console.log('[OS] Registering calculator app component...');
        console.log('[OS] Calculator component:', Calculator);
        if (!Calculator) {
          throw new Error('Calculator component is undefined');
        }
        appComponentRegistry.registerAppComponent('calculator', Calculator);
        console.log('[OS] Calculator app component registered');

        // Register or update calculator app in registry
        const existingCalculator = appRegistry.get('calculator');
        if (!existingCalculator || !existingCalculator.manifest.icon) {
          console.log('[OS] Registering/updating calculator app in registry...');
          const calculatorEntry = {
            id: 'calculator',
            installedAt: existingCalculator?.installedAt || Date.now(),
            installedBy: existingCalculator?.installedBy || 'system',
            enabled: existingCalculator?.enabled ?? true,
            manifest: {
              id: 'calculator',
              name: 'Calculator',
              version: '0.1.0',
              description: 'Calculator',
              entrypoint: '/bin/calculator.js',
              permissions: [],
              icon: appIcons.calculator,
              showInTaskbar: true,
            },
          };
          appRegistry.add(calculatorEntry);
          await appRegistry.save();
          console.log('[OS] Calculator app registered/updated in registry');
        }

        // Register clock app component
        console.log('[OS] Registering clock app component...');
        console.log('[OS] Clock component:', Clock);
        if (!Clock) {
          throw new Error('Clock component is undefined');
        }
        appComponentRegistry.registerAppComponent('clock', Clock);
        console.log('[OS] Clock app component registered');

        // Register or update clock app in registry
        const existingClock = appRegistry.get('clock');
        if (!existingClock || !existingClock.manifest.icon) {
          console.log('[OS] Registering/updating clock app in registry...');
          const clockEntry = {
            id: 'clock',
            installedAt: existingClock?.installedAt || Date.now(),
            installedBy: existingClock?.installedBy || 'system',
            enabled: existingClock?.enabled ?? true,
            manifest: {
              id: 'clock',
              name: 'Clock',
              version: '0.1.0',
              description: 'Clock with stopwatch and timer',
              entrypoint: '/bin/clock.js',
              permissions: [],
              icon: appIcons.clock,
              showInTaskbar: true,
            },
          };
          appRegistry.add(clockEntry);
          await appRegistry.save();
          console.log('[OS] Clock app registered/updated in registry');
        }

        // Register system monitor app component
        console.log('[OS] Registering system monitor app component...');
        console.log('[OS] SystemMonitor component:', SystemMonitor);
        if (!SystemMonitor) {
          throw new Error('SystemMonitor component is undefined');
        }
        appComponentRegistry.registerAppComponent('system-monitor', SystemMonitor);
        console.log('[OS] SystemMonitor app component registered');

        // Register or update system monitor app in registry
        const existingSystemMonitor = appRegistry.get('system-monitor');
        if (!existingSystemMonitor || !existingSystemMonitor.manifest.icon) {
          console.log('[OS] Registering/updating system monitor app in registry...');
          const systemMonitorEntry = {
            id: 'system-monitor',
            installedAt: existingSystemMonitor?.installedAt || Date.now(),
            installedBy: existingSystemMonitor?.installedBy || 'system',
            enabled: existingSystemMonitor?.enabled ?? true,
            manifest: {
              id: 'system-monitor',
              name: 'System Monitor',
              version: '0.1.0',
              description: 'Monitor system resources and processes',
              entrypoint: '/bin/system-monitor.js',
              permissions: ['proc.list', 'proc.kill', 'system.getInfo'],
              icon: appIcons['system-monitor'],
              showInTaskbar: true,
            },
          };
          appRegistry.add(systemMonitorEntry);
          await appRegistry.save();
          console.log('[OS] System Monitor app registered/updated in registry');
        }

        // Register camera app component
        console.log('[OS] Registering camera app component...');
        console.log('[OS] Camera component:', Camera);
        if (!Camera) {
          throw new Error('Camera component is undefined');
        }
        appComponentRegistry.registerAppComponent('camera', Camera);
        console.log('[OS] Camera app component registered');

        // Register or update camera app in registry
        const existingCamera = appRegistry.get('camera');
        if (!existingCamera || !existingCamera.manifest.icon) {
          console.log('[OS] Registering/updating camera app in registry...');
          const cameraEntry = {
            id: 'camera',
            installedAt: existingCamera?.installedAt || Date.now(),
            installedBy: existingCamera?.installedBy || 'system',
            enabled: existingCamera?.enabled ?? true,
            manifest: {
              id: 'camera',
              name: 'Camera',
              version: '0.1.0',
              description: 'Take photos and apply filters',
              entrypoint: '/bin/camera.js',
              permissions: ['media.getUserMedia', 'fs.write', 'notification.create'],
              icon: appIcons.camera,
              showInTaskbar: true,
            },
          };
          appRegistry.add(cameraEntry);
          await appRegistry.save();
          console.log('[OS] Camera app registered/updated in registry');
        }

        // Register music app component
        console.log('[OS] Registering music app component...');
        console.log('[OS] MusicPlayer component:', MusicPlayer);
        if (!MusicPlayer) {
          throw new Error('MusicPlayer component is undefined');
        }
        appComponentRegistry.registerAppComponent('music', MusicPlayer);
        console.log('[OS] MusicPlayer app component registered');

        // Register or update music app in registry
        const existingMusic = appRegistry.get('music');
        if (!existingMusic || !existingMusic.manifest.icon) {
          console.log('[OS] Registering/updating music app in registry...');
          const musicEntry = {
            id: 'music',
            installedAt: existingMusic?.installedAt || Date.now(),
            installedBy: existingMusic?.installedBy || 'system',
            enabled: existingMusic?.enabled ?? true,
            manifest: {
              id: 'music',
              name: 'Music Player',
              version: '0.1.0',
              description: 'Play your favorite tunes',
              entrypoint: '/bin/music.js',
              permissions: ['fs.read', 'audio.play'],
              icon: appIcons.music,
              showInTaskbar: true,
            },
          };
          appRegistry.add(musicEntry);
          await appRegistry.save();
          console.log('[OS] Music app registered/updated in registry');
        }

        // Register calendar app component
        console.log('[OS] Registering calendar app component...');
        console.log('[OS] Calendar component:', Calendar);
        if (!Calendar) {
          throw new Error('Calendar component is undefined');
        }
        appComponentRegistry.registerAppComponent('calendar', Calendar);
        console.log('[OS] Calendar app component registered');

        // Register or update calendar app in registry
        const existingCalendar = appRegistry.get('calendar');
        if (!existingCalendar || !existingCalendar.manifest.icon) {
          console.log('[OS] Registering/updating calendar app in registry...');
          const calendarEntry = {
            id: 'calendar',
            installedAt: existingCalendar?.installedAt || Date.now(),
            installedBy: existingCalendar?.installedBy || 'system',
            enabled: existingCalendar?.enabled ?? true,
            manifest: {
              id: 'calendar',
              name: 'Calendar',
              version: '0.1.0',
              description: 'Manage your events and schedule',
              entrypoint: '/bin/calendar.js',
              permissions: ['fs.read', 'fs.write', 'fs.mkdir'],
              icon: appIcons.calendar,
              showInTaskbar: true,
            },
          };
          appRegistry.add(calendarEntry);
          await appRegistry.save();
          console.log('[OS] Calendar app registered/updated in registry');
        }

        // Register image viewer app component
        console.log('[OS] Registering image viewer app component...');
        console.log('[OS] ImageViewer component:', ImageViewer);
        if (!ImageViewer) {
          throw new Error('ImageViewer component is undefined');
        }
        appComponentRegistry.registerAppComponent('image-viewer', ImageViewer);
        console.log('[OS] ImageViewer app component registered');

        // Register or update image viewer app in registry
        const existingImageViewer = appRegistry.get('image-viewer');
        if (!existingImageViewer || !existingImageViewer.manifest.icon) {
          console.log('[OS] Registering/updating image viewer app in registry...');
          const imageViewerEntry = {
            id: 'image-viewer',
            installedAt: existingImageViewer?.installedAt || Date.now(),
            installedBy: existingImageViewer?.installedBy || 'system',
            enabled: existingImageViewer?.enabled ?? true,
            manifest: {
              id: 'image-viewer',
              name: 'Image Viewer',
              version: '0.1.0',
              description: 'View and browse images',
              entrypoint: '/bin/image-viewer.js',
              permissions: ['fs.read', 'fs.readdir'],
              icon: appIcons['image-viewer'],
              showInTaskbar: true,
            },
          };
          appRegistry.add(imageViewerEntry);
          await appRegistry.save();
          console.log('[OS] Image Viewer app registered/updated in registry');
        }

        // Register video player app component
        console.log('[OS] Registering video player app component...');
        console.log('[OS] VideoPlayer component:', VideoPlayer);
        if (!VideoPlayer) {
          throw new Error('VideoPlayer component is undefined');
        }
        appComponentRegistry.registerAppComponent('video-player', VideoPlayer);
        console.log('[OS] VideoPlayer app component registered');

        // Register or update video player app in registry
        const existingVideoPlayer = appRegistry.get('video-player');
        if (!existingVideoPlayer || !existingVideoPlayer.manifest.icon) {
          console.log('[OS] Registering/updating video player app in registry...');
          const videoPlayerEntry = {
            id: 'video-player',
            installedAt: existingVideoPlayer?.installedAt || Date.now(),
            installedBy: existingVideoPlayer?.installedBy || 'system',
            enabled: existingVideoPlayer?.enabled ?? true,
            manifest: {
              id: 'video-player',
              name: 'Video Player',
              version: '0.1.0',
              description: 'Play video files',
              entrypoint: '/bin/video-player.js',
              permissions: ['fs.read', 'fs.readdir'],
              icon: appIcons['video-player'],
              showInTaskbar: true,
            },
          };
          appRegistry.add(videoPlayerEntry);
          await appRegistry.save();
          console.log('[OS] Video Player app registered/updated in registry');
        }

        // Register contacts app component
        console.log('[OS] Registering contacts app component...');
        console.log('[OS] Contacts component:', Contacts);
        if (!Contacts) {
          throw new Error('Contacts component is undefined');
        }
        appComponentRegistry.registerAppComponent('contacts', Contacts);
        console.log('[OS] Contacts app component registered');

        // Register or update contacts app in registry
        const existingContacts = appRegistry.get('contacts');
        if (!existingContacts || !existingContacts.manifest.icon) {
          console.log('[OS] Registering/updating contacts app in registry...');
          const contactsEntry = {
            id: 'contacts',
            installedAt: existingContacts?.installedAt || Date.now(),
            installedBy: existingContacts?.installedBy || 'system',
            enabled: existingContacts?.enabled ?? true,
            manifest: {
              id: 'contacts',
              name: 'Contacts',
              version: '0.1.0',
              description: 'Manage your contacts',
              entrypoint: '/bin/contacts.js',
              permissions: ['fs.read', 'fs.write', 'fs.mkdir'],
              icon: appIcons.contacts,
              showInTaskbar: true,
            },
          };
          appRegistry.add(contactsEntry);
          await appRegistry.save();
          console.log('[OS] Contacts app registered/updated in registry');
        }

        // Register weather app component
        console.log('[OS] Registering weather app component...');
        console.log('[OS] Weather component:', Weather);
        if (!Weather) {
          throw new Error('Weather component is undefined');
        }
        appComponentRegistry.registerAppComponent('weather', Weather);
        console.log('[OS] Weather app component registered');

        // Register or update weather app in registry
        const existingWeather = appRegistry.get('weather');
        if (!existingWeather || !existingWeather.manifest.icon) {
          console.log('[OS] Registering/updating weather app in registry...');
          const weatherEntry = {
            id: 'weather',
            installedAt: existingWeather?.installedAt || Date.now(),
            installedBy: existingWeather?.installedBy || 'system',
            enabled: existingWeather?.enabled ?? true,
            manifest: {
              id: 'weather',
              name: 'Weather',
              version: '0.1.0',
              description: 'Weather forecast and conditions',
              entrypoint: '/bin/weather.js',
              permissions: ['location.getCurrentPosition'],
              icon: appIcons.weather,
              showInTaskbar: true,
            },
          };
          appRegistry.add(weatherEntry);
          await appRegistry.save();
          console.log('[OS] Weather app registered/updated in registry');
        }

        // Register games app component
        console.log('[OS] Registering games app component...');
        console.log('[OS] Games component:', Games);
        if (!Games) {
          throw new Error('Games component is undefined');
        }
        appComponentRegistry.registerAppComponent('games', Games);
        console.log('[OS] Games app component registered');

        // Register or update games app in registry
        const existingGames = appRegistry.get('games');
        if (!existingGames || !existingGames.manifest.icon) {
          console.log('[OS] Registering/updating games app in registry...');
          const gamesEntry = {
            id: 'games',
            installedAt: existingGames?.installedAt || Date.now(),
            installedBy: existingGames?.installedBy || 'system',
            enabled: existingGames?.enabled ?? true,
            manifest: {
              id: 'games',
              name: 'Games',
              version: '0.1.0',
              description: 'Play classic games',
              entrypoint: '/bin/games.js',
              permissions: [],
              icon: appIcons.games,
              showInTaskbar: true,
            },
          };
          appRegistry.add(gamesEntry);
          await appRegistry.save();
          console.log('[OS] Games app registered/updated in registry');
        }

        // Register screenshot app component
        console.log('[OS] Registering screenshot app component...');
        console.log('[OS] Screenshot component:', Screenshot);
        if (!Screenshot) {
          throw new Error('Screenshot component is undefined');
        }
        appComponentRegistry.registerAppComponent('screenshot', Screenshot);
        console.log('[OS] Screenshot app component registered');

        // Register or update screenshot app in registry
        const existingScreenshot = appRegistry.get('screenshot');
        if (!existingScreenshot || !existingScreenshot.manifest.icon) {
          console.log('[OS] Registering/updating screenshot app in registry...');
          const screenshotEntry = {
            id: 'screenshot',
            installedAt: existingScreenshot?.installedAt || Date.now(),
            installedBy: existingScreenshot?.installedBy || 'system',
            enabled: existingScreenshot?.enabled ?? true,
            manifest: {
              id: 'screenshot',
              name: 'Screenshot',
              version: '0.1.0',
              description: 'Capture and manage screenshots',
              entrypoint: '/bin/screenshot.js',
              permissions: ['fs.read', 'fs.write'],
              icon: appIcons.screenshot,
              showInTaskbar: true,
            },
          };
          appRegistry.add(screenshotEntry);
          await appRegistry.save();
          console.log('[OS] Screenshot app registered/updated in registry');
        }

        // Register voice-recorder app component
        console.log('[OS] Registering voice-recorder app component...');
        console.log('[OS] VoiceRecorder component:', VoiceRecorder);
        if (!VoiceRecorder) {
          throw new Error('VoiceRecorder component is undefined');
        }
        appComponentRegistry.registerAppComponent('voice-recorder', VoiceRecorder);
        console.log('[OS] VoiceRecorder app component registered');

        // Register or update voice-recorder app in registry
        const existingVoiceRecorder = appRegistry.get('voice-recorder');
        if (!existingVoiceRecorder || !existingVoiceRecorder.manifest.icon) {
          console.log('[OS] Registering/updating voice-recorder app in registry...');
          const voiceRecorderEntry = {
            id: 'voice-recorder',
            installedAt: existingVoiceRecorder?.installedAt || Date.now(),
            installedBy: existingVoiceRecorder?.installedBy || 'system',
            enabled: existingVoiceRecorder?.enabled ?? true,
            manifest: {
              id: 'voice-recorder',
              name: 'Voice Recorder',
              version: '0.1.0',
              description: 'Record and manage audio recordings',
              entrypoint: '/bin/voice-recorder.js',
              permissions: ['media.getUserMedia', 'fs.read', 'fs.write'],
              icon: appIcons['voice-recorder'],
              showInTaskbar: true,
            },
          };
          appRegistry.add(voiceRecorderEntry);
          await appRegistry.save();
          console.log('[OS] VoiceRecorder app registered/updated in registry');
        }

        // Register notes app component
        console.log('[OS] Registering notes app component...');
        console.log('[OS] Notes component:', Notes);
        if (!Notes) {
          throw new Error('Notes component is undefined');
        }
        appComponentRegistry.registerAppComponent('notes', Notes);
        console.log('[OS] Notes app component registered');

        // Register or update notes app in registry
        const existingNotes = appRegistry.get('notes');
        if (!existingNotes || !existingNotes.manifest.icon) {
          console.log('[OS] Registering/updating notes app in registry...');
          const notesEntry = {
            id: 'notes',
            installedAt: existingNotes?.installedAt || Date.now(),
            installedBy: existingNotes?.installedBy || 'system',
            enabled: existingNotes?.enabled ?? true,
            manifest: {
              id: 'notes',
              name: 'Notes',
              version: '0.1.0',
              description: 'Sticky notes and quick reminders',
              entrypoint: '/bin/notes.js',
              permissions: ['fs.read', 'fs.write'],
              icon: appIcons.notes,
              showInTaskbar: true,
            },
          };
          appRegistry.add(notesEntry);
          await appRegistry.save();
          console.log('[OS] Notes app registered/updated in registry');
        }

        // Register todo app component
        console.log('[OS] Registering todo app component...');
        console.log('[OS] Todo component:', Todo);
        if (!Todo) {
          throw new Error('Todo component is undefined');
        }
        appComponentRegistry.registerAppComponent('todo', Todo);
        console.log('[OS] Todo app component registered');

        // Register or update todo app in registry
        const existingTodo = appRegistry.get('todo');
        if (!existingTodo || !existingTodo.manifest.icon) {
          console.log('[OS] Registering/updating todo app in registry...');
          const todoEntry = {
            id: 'todo',
            installedAt: existingTodo?.installedAt || Date.now(),
            installedBy: existingTodo?.installedBy || 'system',
            enabled: existingTodo?.enabled ?? true,
            manifest: {
              id: 'todo',
              name: 'Todo List',
              version: '0.1.0',
              description: 'Task management and to-do list',
              entrypoint: '/bin/todo.js',
              permissions: ['fs.read', 'fs.write'],
              icon: appIcons.todo,
              showInTaskbar: true,
            },
          };
          appRegistry.add(todoEntry);
          await appRegistry.save();
          console.log('[OS] Todo app registered/updated in registry');
        }

        // Register file-search app component
        console.log('[OS] Registering file-search app component...');
        console.log('[OS] FileSearch component:', FileSearch);
        if (!FileSearch) {
          throw new Error('FileSearch component is undefined');
        }
        appComponentRegistry.registerAppComponent('file-search', FileSearch);
        console.log('[OS] FileSearch app component registered');

        // Register or update file-search app in registry
        const existingFileSearch = appRegistry.get('file-search');
        if (!existingFileSearch || !existingFileSearch.manifest.icon) {
          console.log('[OS] Registering/updating file-search app in registry...');
          const fileSearchEntry = {
            id: 'file-search',
            installedAt: existingFileSearch?.installedAt || Date.now(),
            installedBy: existingFileSearch?.installedBy || 'system',
            enabled: existingFileSearch?.enabled ?? true,
            manifest: {
              id: 'file-search',
              name: 'File Search',
              version: '0.1.0',
              description: 'Search for files and folders across the system',
              entrypoint: '/bin/file-search.js',
              permissions: ['fs.read', 'fs.readdir'],
              icon: appIcons['file-search'],
              showInTaskbar: true,
            },
          };
          appRegistry.add(fileSearchEntry);
          await appRegistry.save();
          console.log('[OS] FileSearch app registered/updated in registry');
        }

        // Register markdown-editor app component
        console.log('[OS] Registering markdown-editor app component...');
        console.log('[OS] MarkdownEditor component:', MarkdownEditor);
        if (!MarkdownEditor) {
          throw new Error('MarkdownEditor component is undefined');
        }
        appComponentRegistry.registerAppComponent('markdown-editor', MarkdownEditor);
        console.log('[OS] MarkdownEditor app component registered');

        // Register or update markdown-editor app in registry
        const existingMarkdownEditor = appRegistry.get('markdown-editor');
        if (!existingMarkdownEditor || !existingMarkdownEditor.manifest.icon) {
          console.log('[OS] Registering/updating markdown-editor app in registry...');
          const markdownEditorEntry = {
            id: 'markdown-editor',
            installedAt: existingMarkdownEditor?.installedAt || Date.now(),
            installedBy: existingMarkdownEditor?.installedBy || 'system',
            enabled: existingMarkdownEditor?.enabled ?? true,
            manifest: {
              id: 'markdown-editor',
              name: 'Markdown Editor',
              version: '0.1.0',
              description: 'Edit and preview Markdown files',
              entrypoint: '/bin/markdown-editor.js',
              permissions: ['fs.read', 'fs.write'],
              icon: appIcons['markdown-editor'],
              showInTaskbar: true,
            },
          };
          appRegistry.add(markdownEditorEntry);
          await appRegistry.save();
          console.log('[OS] MarkdownEditor app registered/updated in registry');
        }

        // Register password-manager app component
        console.log('[OS] Registering password-manager app component...');
        console.log('[OS] PasswordManager component:', PasswordManager);
        if (!PasswordManager) {
          throw new Error('PasswordManager component is undefined');
        }
        appComponentRegistry.registerAppComponent('password-manager', PasswordManager);
        console.log('[OS] PasswordManager app component registered');

        // Register or update password-manager app in registry
        const existingPasswordManager = appRegistry.get('password-manager');
        if (!existingPasswordManager || !existingPasswordManager.manifest.icon) {
          console.log('[OS] Registering/updating password-manager app in registry...');
          const passwordManagerEntry = {
            id: 'password-manager',
            installedAt: existingPasswordManager?.installedAt || Date.now(),
            installedBy: existingPasswordManager?.installedBy || 'system',
            enabled: existingPasswordManager?.enabled ?? true,
            manifest: {
              id: 'password-manager',
              name: 'Password Manager',
              version: '0.1.0',
              description: 'Secure password storage and management',
              entrypoint: '/bin/password-manager.js',
              permissions: ['fs.read', 'fs.write'],
              icon: appIcons['password-manager'],
              showInTaskbar: true,
            },
          };
          appRegistry.add(passwordManagerEntry);
          await appRegistry.save();
          console.log('[OS] PasswordManager app registered/updated in registry');
        }

        // Register pdf-viewer app component
        console.log('[OS] Registering pdf-viewer app component...');
        console.log('[OS] PDFViewer component:', PDFViewer);
        if (!PDFViewer) {
          throw new Error('PDFViewer component is undefined');
        }
        appComponentRegistry.registerAppComponent('pdf-viewer', PDFViewer);
        console.log('[OS] PDFViewer app component registered');

        // Register or update pdf-viewer app in registry
        const existingPDFViewer = appRegistry.get('pdf-viewer');
        if (!existingPDFViewer || !existingPDFViewer.manifest.icon) {
          console.log('[OS] Registering/updating pdf-viewer app in registry...');
          const pdfViewerEntry = {
            id: 'pdf-viewer',
            installedAt: existingPDFViewer?.installedAt || Date.now(),
            installedBy: existingPDFViewer?.installedBy || 'system',
            enabled: existingPDFViewer?.enabled ?? true,
            manifest: {
              id: 'pdf-viewer',
              name: 'PDF Viewer',
              version: '0.1.0',
              description: 'View PDF documents',
              entrypoint: '/bin/pdf-viewer.js',
              permissions: ['fs.read'],
              icon: appIcons['pdf-viewer'],
              showInTaskbar: true,
            },
          };
          appRegistry.add(pdfViewerEntry);
          await appRegistry.save();
          console.log('[OS] PDFViewer app registered/updated in registry');
        }

        // Initialize workspace manager
        console.log('[OS] Initializing workspace manager...');
        const wm = new WorkspaceManager({
          eventBus,
          windowManager,
          initialWorkspaceCount: workspaceCount,
        });
        setWorkspaceManager(wm);
        console.log('[OS] Workspace manager initialized');

        setInitialized(true);
        console.log('[OS] Initialization complete!');
      } catch (error) {
        console.error('[OS] Failed to initialize OS:', error);
        console.error('[OS] Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    };

    init();
  }, [fs, appRegistry, windowManager, appComponentRegistry, eventBus, workspaceCount, dbName]);

  if (!initialized || !workspaceManager) {
    return <div className="os-loading">Loading...</div>;
  }

  return (
    <DesktopShell
      eventBus={eventBus}
      windowManager={windowManager}
      workspaceManager={workspaceManager}
      appRegistry={appRegistry}
      appComponentRegistry={appComponentRegistry}
      desktop={desktop}
      fs={fs}
      notificationManager={notificationManager}
    />
  );
};

interface DesktopShellProps {
  eventBus: EventBus;
  windowManager: WindowManager;
  workspaceManager: WorkspaceManager;
  appRegistry: AppRegistry;
  appComponentRegistry: AppComponentRegistry;
  desktop?: React.ReactNode;
  fs: FileSystem;
  notificationManager: NotificationManager;
}

const DesktopShell: React.FC<DesktopShellProps> = ({
  eventBus,
  windowManager,
  workspaceManager,
  appRegistry,
  appComponentRegistry,
  desktop,
  fs,
  notificationManager,
}) => {
  const { activeWorkspaceId } = useWorkspace({ workspaceManager, eventBus });
  useKeyboardShortcuts({ workspaceManager, enabled: true });

  // Make windows reactive by using useState and useEffect
  const [windows, setWindows] = useState<Window[]>(() => 
    windowManager.getWindowsInWorkspace(activeWorkspaceId)
  );

  // Update windows when workspace changes or window events occur
  useEffect(() => {
    const updateWindows = () => {
      const currentWindows = windowManager.getWindowsInWorkspace(activeWorkspaceId);
      console.log('[OS] Updating windows list:', currentWindows.length, 'windows');
      setWindows(currentWindows);
    };

    // Initial update
    updateWindows();

    // Subscribe to window events
    const unsubscribeCreated = eventBus.on('window:created', () => {
      console.log('[OS] Window created event received, updating windows list');
      updateWindows();
    });

    const unsubscribeUpdated = eventBus.on('window:updated', () => {
      updateWindows();
    });

    const unsubscribeDestroyed = eventBus.on('window:destroyed', () => {
      console.log('[OS] Window destroyed event received, updating windows list');
      updateWindows();
    });

    const unsubscribeMinimized = eventBus.on('window:minimized', () => {
      updateWindows();
    });

    const unsubscribeRestored = eventBus.on('window:restored', () => {
      updateWindows();
    });

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDestroyed();
      unsubscribeMinimized();
      unsubscribeRestored();
    };
  }, [eventBus, windowManager, activeWorkspaceId]);

  // Handle app launching
  useEffect(() => {
    console.log('[OS] Setting up taskbar:shortcut:clicked event listener');
    
    const handleShortcutClick = (event: any) => {
      console.log('[OS] Received taskbar:shortcut:clicked event:', event);
      const { appId, forceNew } = event.payload || {};
      
      if (!appId) {
        console.warn('[OS] No appId in event payload:', event);
        return;
      }

      console.log('[OS] Attempting to launch app:', appId, 'forceNew:', forceNew);

      // Check if app is installed and enabled
      const app = appRegistry.get(appId);
      if (!app || !app.enabled) {
        console.warn(`[OS] App ${appId} is not installed or not enabled`, { app, enabled: app?.enabled });
        return;
      }

      console.log('[OS] App found in registry:', app.manifest.name);

      // Check if app component is registered
      if (!appComponentRegistry.hasAppComponent(appId)) {
        console.warn(`[OS] App component for ${appId} is not registered`);
        return;
      }

      console.log('[OS] App component is registered');

      // If forceNew is true, always create a new window
      if (forceNew) {
        console.log('[OS] Creating new window (forceNew=true) for app:', app.manifest.name);
        try {
          const windowId = windowManager.createWindow({
            title: app.manifest.name,
            width: 600,
            height: 500,
            workspaceId: activeWorkspaceId,
            appId: appId,
          });
          console.log('[OS] Window created successfully:', windowId);
        } catch (error) {
          console.error('[OS] Failed to create window:', error);
        }
        return;
      }

      // Check if app already has an open window in the active workspace
      const existingWindows = windowManager.getWindowsInWorkspace(activeWorkspaceId);
      const existingWindow = existingWindows.find((w: Window) => w.appId === appId && w.state !== 'minimized');

      if (existingWindow) {
        console.log('[OS] Focusing existing window:', existingWindow.id);
        // Focus existing window
        windowManager.focusWindow(existingWindow.id);
        if (existingWindow.state === 'minimized') {
          windowManager.restoreWindow(existingWindow.id);
        }
      } else {
        console.log('[OS] Creating new window for app:', app.manifest.name);
        try {
          const windowId = windowManager.createWindow({
            title: app.manifest.name,
            width: 600,
            height: 500,
            workspaceId: activeWorkspaceId,
            appId: appId,
          });
          console.log('[OS] Window created successfully:', windowId);
        } catch (error) {
          console.error('[OS] Failed to create window:', error);
        }
      }
    };

    const unsubscribe = eventBus.on('taskbar:shortcut:clicked', handleShortcutClick);
    console.log('[OS] Event listener registered for taskbar:shortcut:clicked');

    return () => {
      console.log('[OS] Unsubscribing from taskbar:shortcut:clicked event');
      unsubscribe();
    };
  }, [eventBus, appRegistry, appComponentRegistry, windowManager, activeWorkspaceId]);

  return (
    <div className="os">
      <Workspace
        workspaceId={activeWorkspaceId}
        windows={windows}
        windowManager={windowManager}
        appComponentRegistry={appComponentRegistry}
        eventBus={eventBus}
      >
        {desktop ?? (
          <Desktop
            eventBus={eventBus}
            windowManager={windowManager}
            appRegistry={appRegistry}
            appComponentRegistry={appComponentRegistry}
            workspaceManager={workspaceManager}
            activeWorkspaceId={activeWorkspaceId}
          />
        )}
      </Workspace>
      <Taskbar
        windowManager={windowManager}
        appRegistry={appRegistry}
        workspaceManager={workspaceManager}
        eventBus={eventBus}
        activeWorkspaceId={activeWorkspaceId}
        fs={fs}
        notificationManager={notificationManager}
      />
      <NotificationOverlay
        notificationManager={notificationManager}
        eventBus={eventBus}
      />
    </div>
  );
};

// Notification overlay component
import { NotificationToast } from '@browser-os/notifications';
import { useNotifications } from '@browser-os/notifications';

interface NotificationOverlayProps {
  notificationManager: NotificationManager;
  eventBus: EventBus;
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  notificationManager,
  eventBus,
}) => {
  const { notifications } = useNotifications({ notificationManager });
  const settings = notificationManager.getSettings();

  const handleDismiss = (id: string) => {
    notificationManager.dismissNotification(id);
  };

  const handleNotificationClick = (notification: import('@browser-os/schemas').Notification) => {
    // Handle notification click - could open app or window
    if (notification.appId) {
      eventBus.emit('taskbar:shortcut:clicked', { appId: notification.appId }, { source: 'notification' });
    }
  };

  const handleNotificationAction = (
    notification: import('@browser-os/schemas').Notification,
    action: string,
    data?: unknown
  ) => {
    // Handle notification action
    if (action === 'open-file' && data && typeof data === 'object' && 'path' in data) {
      // Open file browser with path
      eventBus.emit('taskbar:shortcut:clicked', { appId: 'file-browser' }, { source: 'notification' });
    }
  };

  return (
    <NotificationToast
      notifications={notifications}
      position={settings.toastPosition}
      autoDismissTimeout={settings.autoDismissTimeout}
      onDismiss={handleDismiss}
      onClick={handleNotificationClick}
      onAction={handleNotificationAction}
    />
  );
};
