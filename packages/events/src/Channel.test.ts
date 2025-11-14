import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from './EventBus';
import { Channel } from './Channel';

describe('Channel', () => {
  let bus: EventBus;
  let channel: Channel;

  beforeEach(() => {
    bus = new EventBus();
    channel = new Channel('test-channel', bus);
  });

  describe('send/on', () => {
    it('should send and receive messages', () => {
      const handler = vi.fn();
      channel.on('message', handler);

      channel.send('message', { data: 'test' });

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'channel:test-channel:message',
          payload: { data: 'test' },
        })
      );
    });

    it('should support multiple message types', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      channel.on('type1', handler1);
      channel.on('type2', handler2);

      channel.send('type1', { data: 'test1' });
      channel.send('type2', { data: 'test2' });

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
    });
  });

  describe('request/respond', () => {
    it('should handle request-response', async () => {
      channel.respond('get:data', async (payload) => {
        return { value: (payload as { key: string }).key };
      });

      const response = await channel.request('get:data', { key: 'test' });

      expect(response).toEqual({ value: 'test' });
    });

    it('should handle async responses', async () => {
      channel.respond('get:data', async (payload) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { value: 'async' };
      });

      const response = await channel.request('get:data', {});

      expect(response).toEqual({ value: 'async' });
    });
  });

  describe('isolation', () => {
    it('should isolate channels', () => {
      const channel1 = new Channel('channel1', bus);
      const channel2 = new Channel('channel2', bus);

      const handler1 = vi.fn();
      const handler2 = vi.fn();

      channel1.on('message', handler1);
      channel2.on('message', handler2);

      channel1.send('message', { data: 'test1' });
      channel2.send('message', { data: 'test2' });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });
});

