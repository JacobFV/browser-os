import type { EventBus } from '@browser-os/events';

export interface MediaManagerOptions {
  eventBus?: EventBus;
}

export interface MediaStreamConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

/**
 * Media Manager for camera/microphone access
 */
export class MediaManager {
  private eventBus?: EventBus;
  private streams: Map<string, MediaStream> = new Map();

  constructor(options?: MediaManagerOptions) {
    this.eventBus = options?.eventBus;
  }

  /**
   * Get user media (camera/microphone)
   */
  async getUserMedia(constraints: MediaStreamConstraints): Promise<{ streamId: string; tracks: Array<{ id: string; kind: string; label: string }> }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const streamId = `stream-${Date.now()}-${Math.random()}`;
      
      this.streams.set(streamId, stream);

      const tracks = stream.getTracks().map((track) => ({
        id: track.id,
        kind: track.kind,
        label: track.label,
      }));

      // Listen for track ended events
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          this.eventBus?.emit('media:trackEnded', { streamId, trackId: track.id }, { source: 'media-manager' });
        });
      });

      this.eventBus?.emit('media:streamCreated', { streamId, tracks }, { source: 'media-manager' });

      return { streamId, tracks };
    } catch (error) {
      this.eventBus?.emit('media:error', { error: error instanceof Error ? error.message : 'Unknown error' }, { source: 'media-manager' });
      throw error;
    }
  }

  /**
   * Stop media stream
   */
  stopStream(streamId: string): void {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      this.streams.delete(streamId);
      this.eventBus?.emit('media:streamStopped', { streamId }, { source: 'media-manager' });
    }
  }

  /**
   * Stop all media streams
   */
  stopAllStreams(): void {
    for (const [streamId, stream] of this.streams.entries()) {
      stream.getTracks().forEach((track) => track.stop());
      this.eventBus?.emit('media:streamStopped', { streamId }, { source: 'media-manager' });
    }
    this.streams.clear();
  }

  /**
   * Get available devices
   */
  async enumerateDevices(): Promise<Array<{ deviceId: string; kind: string; label: string; groupId: string }>> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.map((device) => ({
        deviceId: device.deviceId,
        kind: device.kind,
        label: device.label,
        groupId: device.groupId,
      }));
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return [];
    }
  }

  /**
   * Get stream by ID
   */
  getStream(streamId: string): MediaStream | null {
    return this.streams.get(streamId) ?? null;
  }
}

