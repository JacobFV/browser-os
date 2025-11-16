import type { EventBus } from '@browser-os/events';

export interface AudioManagerOptions {
  eventBus?: EventBus;
}

export interface AudioPlayOptions {
  volume?: number; // 0-1
  loop?: boolean;
  playbackRate?: number;
}

/**
 * Audio Manager for audio playback
 */
export class AudioManager {
  private eventBus?: EventBus;
  private audioContext: AudioContext | null = null;
  private audioElements: Map<string, HTMLAudioElement> = new Map();

  constructor(options?: AudioManagerOptions) {
    this.eventBus = options?.eventBus;
  }

  /**
   * Get or create AudioContext
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  /**
   * Play audio from URL
   */
  async play(url: string, options?: AudioPlayOptions): Promise<string> {
    try {
      const audioId = `audio-${Date.now()}-${Math.random()}`;
      const audio = new Audio(url);

      if (options?.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume));
      }
      if (options?.loop !== undefined) {
        audio.loop = options.loop;
      }
      if (options?.playbackRate !== undefined) {
        audio.playbackRate = options.playbackRate;
      }

      // Store audio element
      this.audioElements.set(audioId, audio);

      // Listen for events
      audio.addEventListener('ended', () => {
        this.audioElements.delete(audioId);
        this.eventBus?.emit('audio:ended', { audioId, url }, { source: 'audio-manager' });
      });

      audio.addEventListener('error', (error) => {
        this.audioElements.delete(audioId);
        this.eventBus?.emit('audio:error', { audioId, url, error: error.message }, { source: 'audio-manager' });
      });

      await audio.play();
      this.eventBus?.emit('audio:playing', { audioId, url }, { source: 'audio-manager' });

      return audioId;
    } catch (error) {
      throw new Error(`Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop audio playback
   */
  stop(audioId: string): void {
    const audio = this.audioElements.get(audioId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.audioElements.delete(audioId);
      this.eventBus?.emit('audio:stopped', { audioId }, { source: 'audio-manager' });
    }
  }

  /**
   * Pause audio playback
   */
  pause(audioId: string): void {
    const audio = this.audioElements.get(audioId);
    if (audio) {
      audio.pause();
      this.eventBus?.emit('audio:paused', { audioId }, { source: 'audio-manager' });
    }
  }

  /**
   * Resume audio playback
   */
  async resume(audioId: string): Promise<void> {
    const audio = this.audioElements.get(audioId);
    if (audio) {
      await audio.play();
      this.eventBus?.emit('audio:resumed', { audioId }, { source: 'audio-manager' });
    }
  }

  /**
   * Set volume for audio
   */
  setVolume(audioId: string, volume: number): void {
    const audio = this.audioElements.get(audioId);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get volume for audio
   */
  getVolume(audioId: string): number | null {
    const audio = this.audioElements.get(audioId);
    return audio ? audio.volume : null;
  }

  /**
   * Play beep sound
   */
  async beep(frequency: number = 440, duration: number = 200): Promise<void> {
    try {
      const context = this.getAudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration / 1000);

      this.eventBus?.emit('audio:beep', { frequency, duration }, { source: 'audio-manager' });
    } catch (error) {
      console.error('Failed to play beep:', error);
    }
  }
}

