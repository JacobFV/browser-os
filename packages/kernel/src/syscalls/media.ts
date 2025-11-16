import type { MediaManager } from '@browser-os/media';
import type { SyscallHandler } from '../types';

export function createMediaSyscalls(mediaManager: MediaManager): Record<string, SyscallHandler> {
  return {
    'media.getUserMedia': async (args) => {
      const constraints = args.constraints as {
        video?: boolean | Record<string, unknown>;
        audio?: boolean | Record<string, unknown>;
      } | undefined;

      if (!constraints) {
        throw new Error('constraints required');
      }

      return await mediaManager.getUserMedia(constraints);
    },

    'media.stopStream': async (args) => {
      const streamId = args.streamId as string;
      if (!streamId) {
        throw new Error('streamId required');
      }

      mediaManager.stopStream(streamId);
      return null;
    },

    'media.stopAllStreams': async () => {
      mediaManager.stopAllStreams();
      return null;
    },

    'media.enumerateDevices': async () => {
      return await mediaManager.enumerateDevices();
    },
  };
}

