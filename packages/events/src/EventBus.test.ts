import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from './EventBus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('on/emit', () => {
    it('should subscribe and emit events', () => {
      const handler = vi.fn();
      bus.on('test:event', handler);

      bus.emit('test:event', { data: 'test' });

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test:event',
          payload: { data: 'test' },
        })
      );
    });

    it('should support multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bus.on('test:event', handler1);
      bus.on('test:event', handler2);

      bus.emit('test:event', { data: 'test' });

      expect(handler1).toHaveBeenCalledOnce();
      expect(handler2).toHaveBeenCalledOnce();
    });

    it('should unsubscribe when unsubscribe is called', () => {
      const handler = vi.fn();
      const unsubscribe = bus.on('test:event', handler);

      bus.emit('test:event', { data: 'test' });
      expect(handler).toHaveBeenCalledOnce();

      unsubscribe();
      bus.emit('test:event', { data: 'test2' });

      expect(handler).toHaveBeenCalledOnce(); // Still only called once
    });

    it('should include source and target in events', () => {
      const handler = vi.fn();
      bus.on('test:event', handler);

      bus.emit('test:event', { data: 'test' }, { source: 'proc:123', target: 'proc:456' });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'proc:123',
          target: 'proc:456',
        })
      );
    });
  });

  describe('onPattern', () => {
    it('should match string patterns', () => {
      const handler = vi.fn();
      bus.onPattern('test:', handler);

      bus.emit('test:event', { data: 'test' });
      bus.emit('test:another', { data: 'test' });
      bus.emit('other:event', { data: 'test' });

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should match regex patterns', () => {
      const handler = vi.fn();
      bus.onPattern(/^proc:\d+:/, handler);

      bus.emit('proc:123:spawned', {});
      bus.emit('proc:456:terminated', {});
      bus.emit('fs:read', {});

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('request/respond', () => {
    it('should handle request-response pattern', async () => {
      bus.respond('get:data', async (event) => {
        return { value: 'response' };
      });

      const response = await bus.request('get:data', { key: 'test' });

      expect(response).toEqual({ value: 'response' });
    });

    it('should timeout if no response', async () => {
      await expect(bus.request('get:data', {}, { timeout: 100 })).rejects.toThrow('Request timeout');
    });

    it('should handle errors in response handler', async () => {
      bus.respond('get:data', async () => {
        throw new Error('Handler error');
      });

      // Error should be handled gracefully
      await expect(bus.request('get:data', {})).rejects.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bus.on('test:event', handler1);
      bus.onPattern('test:', handler2);

      bus.clear();

      bus.emit('test:event', { data: 'test' });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });
});

