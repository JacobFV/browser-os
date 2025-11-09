import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from './container';
import { EventBus } from './event-bus';

describe('Container', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe('register and resolve', () => {
    it('should register and resolve a service instance', () => {
      const eventBus = new EventBus();
      container.register('eventBus', eventBus);
      
      const resolved = container.resolve('eventBus');
      expect(resolved).toBe(eventBus);
      expect(resolved).toBeInstanceOf(EventBus);
    });

    it('should resolve the same instance on multiple calls', () => {
      const eventBus = new EventBus();
      container.register('eventBus', eventBus);
      
      const resolved1 = container.resolve('eventBus');
      const resolved2 = container.resolve('eventBus');
      
      expect(resolved1).toBe(resolved2);
      expect(resolved1).toBe(eventBus);
    });

    it('should throw error when resolving unregistered dependency', () => {
      expect(() => {
        container.resolve('eventBus');
      }).toThrow('Dependency eventBus not found');
    });
  });

  describe('registerFactory', () => {
    it('should register and resolve via factory', () => {
      let callCount = 0;
      const eventBus = new EventBus();
      
      container.registerFactory('eventBus', () => {
        callCount++;
        return eventBus;
      });
      
      const resolved1 = container.resolve('eventBus');
      const resolved2 = container.resolve('eventBus');
      
      // Factory should only be called once (instance cached)
      expect(callCount).toBe(1);
      expect(resolved1).toBe(resolved2);
      expect(resolved1).toBe(eventBus);
    });

    it('should cache factory-created instances', () => {
      let callCount = 0;
      const createdInstances: EventBus[] = [];
      
      container.registerFactory('eventBus', () => {
        callCount++;
        const instance = new EventBus();
        createdInstances.push(instance);
        return instance;
      });
      
      const resolved1 = container.resolve('eventBus');
      const resolved2 = container.resolve('eventBus');
      
      // Factory called once, instance cached
      expect(callCount).toBe(1);
      expect(resolved1).toBe(resolved2);
      expect(createdInstances.length).toBe(1);
    });
  });

  describe('has', () => {
    it('should return true for registered instance', () => {
      container.register('eventBus', new EventBus());
      expect(container.has('eventBus')).toBe(true);
    });

    it('should return true for registered factory', () => {
      container.registerFactory('eventBus', () => new EventBus());
      expect(container.has('eventBus')).toBe(true);
    });

    it('should return false for unregistered dependency', () => {
      expect(container.has('eventBus')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all registered services and factories', () => {
      container.register('eventBus', new EventBus());
      container.registerFactory('processManager', () => {
        // Mock factory - we can't import ProcessManager in tests
        return {} as any;
      });
      
      container.clear();
      
      expect(container.has('eventBus')).toBe(false);
      expect(container.has('processManager')).toBe(false);
      expect(() => container.resolve('eventBus')).toThrow();
    });
  });

  describe('type safety', () => {
    it('should enforce correct types at compile time', () => {
      const eventBus = new EventBus();
      container.register('eventBus', eventBus);
      
      // TypeScript should infer the correct type
      const resolved: EventBus = container.resolve('eventBus');
      expect(resolved).toBeInstanceOf(EventBus);
    });

    it('should support dependency chain resolution', () => {
      const eventBus = new EventBus();
      container.register('eventBus', eventBus);
      
      // Verify we can resolve and use the resolved dependency
      const resolved = container.resolve('eventBus');
      expect(resolved).toBeInstanceOf(EventBus);
      expect(resolved).toBe(eventBus);
    });
  });
});

