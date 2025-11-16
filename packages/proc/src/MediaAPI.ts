/**
 * Media API for processes to access camera/microphone
 */

export interface MediaStreamConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

export interface MediaTrackInfo {
  id: string;
  kind: string;
  label: string;
}

export interface MediaDeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
}

/**
 * Media API factory
 */
export class MediaAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Get user media (camera/microphone)
   */
  async getUserMedia(constraints: MediaStreamConstraints): Promise<{ streamId: string; tracks: MediaTrackInfo[] }> {
    return (await this.syscall('media.getUserMedia', { constraints })) as { streamId: string; tracks: MediaTrackInfo[] };
  }

  /**
   * Stop media stream
   */
  async stopStream(streamId: string): Promise<void> {
    await this.syscall('media.stopStream', { streamId });
  }

  /**
   * Stop all media streams
   */
  async stopAllStreams(): Promise<void> {
    await this.syscall('media.stopAllStreams', {});
  }

  /**
   * Enumerate available media devices
   */
  async enumerateDevices(): Promise<MediaDeviceInfo[]> {
    return (await this.syscall('media.enumerateDevices', {})) as MediaDeviceInfo[];
  }
}

