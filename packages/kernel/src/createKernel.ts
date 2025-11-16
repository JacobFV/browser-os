import { EventBus } from '@browser-os/events';
import { Kernel, type KernelOptions } from './Kernel';
import { WindowManager } from '@browser-os/windowing';
import { NotificationManager } from '@browser-os/notifications';
import { DialogManager } from '@browser-os/dialogs';
import { ClipboardManager } from '@browser-os/clipboard';
import { StorageManager } from '@browser-os/storage';
import { NetworkManager } from '@browser-os/network';
import { SystemInfoManager } from '@browser-os/system';
import { PowerManager } from '@browser-os/power';
import { AudioManager } from '@browser-os/audio';
import { MediaManager } from '@browser-os/media';
import { LocationManager } from '@browser-os/location';
import { SensorManager } from '@browser-os/sensor';
import { PrintManager } from '@browser-os/print';

export interface CreateKernelOptions {
  eventBus?: EventBus;
  windowManager?: WindowManager;
  notificationManager?: NotificationManager;
  dialogManager?: DialogManager;
  clipboardManager?: ClipboardManager;
  storageManager?: StorageManager;
  networkManager?: NetworkManager;
  systemInfoManager?: SystemInfoManager;
  powerManager?: PowerManager;
  audioManager?: AudioManager;
  mediaManager?: MediaManager;
  locationManager?: LocationManager;
  sensorManager?: SensorManager;
  printManager?: PrintManager;
  /**
   * If true, creates default instances for managers that aren't provided
   */
  createDefaults?: boolean;
}

/**
 * Create a Kernel instance with all managers configured
 */
export function createKernel(options: CreateKernelOptions = {}): Kernel {
  const {
    eventBus = new EventBus(),
    createDefaults = true,
  } = options;

  const kernelOptions: KernelOptions = {
    eventBus,
    windowManager: options.windowManager ?? (createDefaults ? new WindowManager({ eventBus }) : undefined),
    notificationManager: options.notificationManager ?? (createDefaults ? new NotificationManager({ eventBus }) : undefined),
    dialogManager: options.dialogManager ?? (createDefaults ? new DialogManager({ eventBus }) : undefined),
    clipboardManager: options.clipboardManager ?? (createDefaults ? new ClipboardManager({ eventBus }) : undefined),
    storageManager: options.storageManager ?? (createDefaults ? new StorageManager({ eventBus }) : undefined),
    networkManager: options.networkManager ?? (createDefaults ? new NetworkManager({ eventBus }) : undefined),
    systemInfoManager: options.systemInfoManager ?? (createDefaults ? new SystemInfoManager({ eventBus }) : undefined),
    powerManager: options.powerManager ?? (createDefaults ? new PowerManager({ eventBus }) : undefined),
    audioManager: options.audioManager ?? (createDefaults ? new AudioManager({ eventBus }) : undefined),
    mediaManager: options.mediaManager ?? (createDefaults ? new MediaManager({ eventBus }) : undefined),
    locationManager: options.locationManager ?? (createDefaults ? new LocationManager({ eventBus }) : undefined),
    sensorManager: options.sensorManager ?? (createDefaults ? new SensorManager({ eventBus }) : undefined),
    printManager: options.printManager ?? (createDefaults ? new PrintManager({ eventBus }) : undefined),
  };

  return new Kernel(kernelOptions);
}

