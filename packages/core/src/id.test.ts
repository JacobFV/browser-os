import { describe, it, expect, beforeEach } from 'vitest';
import { createId, Clock } from './id';
import { eventBus, WindowEvent } from './event-bus';

describe('ID Generation', () => {
  it('should generate unique IDs', () => {
    const id1 = createId();
    const id2 = createId();
    
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });
  
  it('should generate ULID format IDs', () => {
    const id = createId();
    // ULIDs are 26 characters
    expect(id.length).toBe(26);
  });
});

describe('Clock', () => {
  it('should return current timestamp', () => {
    const now = Clock.now();
    expect(typeof now).toBe('number');
    expect(now).toBeGreaterThan(0);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
  
  it('should return current seconds', () => {
    const seconds = Clock.nowSeconds();
    expect(typeof seconds).toBe('number');
    expect(seconds).toBeGreaterThan(0);
    expect(Math.floor(seconds)).toBe(seconds);
  });
  
  it('should return ISO timestamp', () => {
    const timestamp = Clock.timestamp();
    expect(typeof timestamp).toBe('string');
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('Event Bus', () => {
  beforeEach(() => {
    eventBus.clear();
  });
  
  it('should subscribe and emit events', () => {
    let received: WindowEvent | null = null;
    
    const unsubscribe = eventBus.on('window', (event) => {
      received = event;
    });
    
    const testEvent: WindowEvent = { type: 'open', winId: 'win-1', appId: 'app-1' };
    eventBus.emit('window', testEvent);
    
    expect(received).toEqual(testEvent);
    
    unsubscribe();
  });
  
  it('should handle multiple subscribers', () => {
    const received: WindowEvent[] = [];
    
    eventBus.on('window', (event) => {
      received.push(event);
    });
    
    eventBus.on('window', (event) => {
      received.push(event);
    });
    
    const testEvent: WindowEvent = { type: 'open', winId: 'win-1', appId: 'app-1' };
    eventBus.emit('window', testEvent);
    
    expect(received.length).toBe(2);
    expect(received[0]).toEqual(testEvent);
    expect(received[1]).toEqual(testEvent);
  });
  
  it('should unsubscribe correctly', () => {
    let callCount = 0;
    
    const unsubscribe = eventBus.on('window', () => {
      callCount++;
    });
    
    eventBus.emit('window', { type: 'open', winId: 'win-1', appId: 'app-1' });
    expect(callCount).toBe(1);
    
    unsubscribe();
    
    eventBus.emit('window', { type: 'open', winId: 'win-2', appId: 'app-2' });
    expect(callCount).toBe(1); // Should not increment
  });
  
  it('should clear all handlers', () => {
    let callCount = 0;
    
    eventBus.on('window', () => callCount++);
    eventBus.on('proc', () => callCount++);
    
    eventBus.clear('window');
    
    eventBus.emit('window', { type: 'open', winId: 'win-1', appId: 'app-1' });
    eventBus.emit('proc', { type: 'spawn', pid: 'pid-1', appId: 'app-1' });
    
    expect(callCount).toBe(1); // Only proc event fired
  });
});

