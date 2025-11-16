import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationManager } from './NotificationManager';
import { EventBus } from '@browser-os/events';

describe('NotificationManager', () => {
  let manager: NotificationManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    manager = new NotificationManager({ eventBus });
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('createNotification', () => {
    it('should create a notification', () => {
      const notification = manager.createNotification({
        title: 'Test',
        message: 'Test message',
      });

      expect(notification).toBeDefined();
      expect(notification.title).toBe('Test');
      expect(notification.message).toBe('Test message');
      expect(notification.status).toBe('pending');
    });

    it('should add notification to store', () => {
      manager.createNotification({
        title: 'Test',
        message: 'Test message',
      });

      const notifications = manager.getNotifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].title).toBe('Test');
    });

    it('should emit notification:created event', () => {
      const handler = vi.fn();
      eventBus.on('notification:created', handler);

      manager.createNotification({
        title: 'Test',
        message: 'Test message',
      });

      expect(handler).toHaveBeenCalledOnce();
    });
  });

  describe('dismissNotification', () => {
    it('should dismiss a notification', () => {
      const notification = manager.createNotification({
        title: 'Test',
        message: 'Test message',
      });

      manager.dismissNotification(notification.id);

      const notifications = manager.getNotifications();
      expect(notifications[0].status).toBe('dismissed');
      expect(notifications[0].dismissedAt).toBeDefined();
    });

    it('should emit notification:dismissed event', () => {
      const handler = vi.fn();
      eventBus.on('notification:dismissed', handler);

      const notification = manager.createNotification({
        title: 'Test',
        message: 'Test message',
      });

      manager.dismissNotification(notification.id);

      expect(handler).toHaveBeenCalledOnce();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notification = manager.createNotification({
        title: 'Test',
        message: 'Test message',
      });

      manager.markAsRead(notification.id);

      const notifications = manager.getNotifications();
      expect(notifications[0].status).toBe('read');
      expect(notifications[0].readAt).toBeDefined();
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', () => {
      manager.createNotification({ title: 'Test 1', message: 'Message 1' });
      manager.createNotification({ title: 'Test 2', message: 'Message 2' });
      manager.createNotification({ title: 'Test 3', message: 'Message 3' });

      expect(manager.getUnreadCount()).toBe(3);

      const notifications = manager.getNotifications();
      manager.markAsRead(notifications[0].id);

      expect(manager.getUnreadCount()).toBe(2);
    });
  });

  describe('subscribe', () => {
    it('should call callback when notifications change', () => {
      const callback = vi.fn();
      const unsubscribe = manager.subscribe(callback);

      expect(callback).toHaveBeenCalled();

      manager.createNotification({
        title: 'Test',
        message: 'Test message',
      });

      expect(callback).toHaveBeenCalledTimes(2);

      unsubscribe();
    });
  });

  describe('event bus integration', () => {
    it('should create notification from event', () => {
      eventBus.emit('notification:create', {
        title: 'Event Test',
        message: 'Event message',
      });

      const notifications = manager.getNotifications();
      expect(notifications.length).toBe(1);
      expect(notifications[0].title).toBe('Event Test');
    });
  });
});

