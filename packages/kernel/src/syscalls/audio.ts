import type { AudioManager } from '@browser-os/audio';
import type { SyscallHandler } from '../types';

export function createAudioSyscalls(audioManager: AudioManager): Record<string, SyscallHandler> {
  return {
    'audio.play': async (args) => {
      const url = args.url as string;
      const options = args.options as {
        volume?: number;
        loop?: boolean;
        playbackRate?: number;
      } | undefined;

      if (!url) {
        throw new Error('url required');
      }

      return await audioManager.play(url, options);
    },

    'audio.stop': async (args) => {
      const audioId = args.audioId as string;
      if (!audioId) {
        throw new Error('audioId required');
      }

      audioManager.stop(audioId);
      return null;
    },

    'audio.pause': async (args) => {
      const audioId = args.audioId as string;
      if (!audioId) {
        throw new Error('audioId required');
      }

      audioManager.pause(audioId);
      return null;
    },

    'audio.resume': async (args) => {
      const audioId = args.audioId as string;
      if (!audioId) {
        throw new Error('audioId required');
      }

      await audioManager.resume(audioId);
      return null;
    },

    'audio.setVolume': async (args) => {
      const audioId = args.audioId as string;
      const volume = args.volume as number;
      if (!audioId) {
        throw new Error('audioId required');
      }
      if (typeof volume !== 'number' || volume < 0 || volume > 1) {
        throw new Error('volume must be a number between 0 and 1');
      }

      audioManager.setVolume(audioId, volume);
      return null;
    },

    'audio.getVolume': async (args) => {
      const audioId = args.audioId as string;
      if (!audioId) {
        throw new Error('audioId required');
      }

      return audioManager.getVolume(audioId);
    },

    'audio.beep': async (args) => {
      const frequency = (args.frequency as number) ?? 440;
      const duration = (args.duration as number) ?? 200;

      await audioManager.beep(frequency, duration);
      return null;
    },
  };
}

