import type { ServiceDefinition } from './types';

/**
 * Registry for managing available services
 */
export class ServiceRegistry {
  private services: Map<string, ServiceDefinition> = new Map();

  /**
   * Register a service
   */
  register(service: ServiceDefinition): void {
    this.services.set(service.name, service);
  }

  /**
   * Unregister a service
   */
  unregister(name: string): void {
    this.services.delete(name);
  }

  /**
   * Get a service by name
   */
  get(name: string): ServiceDefinition | undefined {
    return this.services.get(name);
  }

  /**
   * Get all services
   */
  getAll(): ServiceDefinition[] {
    return Array.from(this.services.values());
  }

  /**
   * Get enabled services
   */
  getEnabled(): ServiceDefinition[] {
    return Array.from(this.services.values()).filter((s) => s.enabled);
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Enable a service
   */
  enable(name: string): void {
    const service = this.services.get(name);
    if (service) {
      service.enabled = true;
    }
  }

  /**
   * Disable a service
   */
  disable(name: string): void {
    const service = this.services.get(name);
    if (service) {
      service.enabled = false;
    }
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
  }
}

