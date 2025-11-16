/**
 * Audio API for processes to play audio
 */

export interface AudioPlayOptions {
  volume?: number; // 0-1
  loop?: boolean;
  playbackRate?: number;
}

/**
 * Audio API factory
 */
export class AudioAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Play audio from URL
   */
  async play(url: string, options?: AudioPlayOptions): Promise<string> {
    return (await this.syscall('audio.play', { url, options })) as string;
  }

  /**
   * Stop audio playback
   */
  async stop(audioId: string): Promise<void> {
    await this.syscall('audio.stop', { audioId });
  }

  /**
   * Pause audio playback
   */
  async pause(audioId: string): Promise<void> {
    await this.syscall('audio.pause', { audioId });
  }

  /**
   * Resume audio playback
   */
  async resume(audioId: string): Promise<void> {
    await this.syscall('audio.resume', { audioId });
  }

  /**
   * Set volume for audio
   */
  async setVolume(audioId: string, volume: number): Promise<void> {
    await this.syscall('audio.setVolume', { audioId, volume });
  }

  /**
   * Get volume for audio
   */
  async getVolume(audioId: string): Promise<number | null> {
    return (await this.syscall('audio.getVolume', { audioId })) as number | null;
  }

  /**
   * Play beep sound
   */
  async beep(frequency?: number, duration?: number): Promise<void> {
    await this.syscall('audio.beep', { frequency, duration });
  }
}

