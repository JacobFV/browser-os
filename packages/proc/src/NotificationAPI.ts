/**
 * Notification API for processes to create and manage notifications
 */

export interface NotificationOptions {
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    action: string;
    data?: unknown;
  }>;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'read' | 'dismissed';
  createdAt: number;
  appId?: string;
  actions?: Array<{
    label: string;
    action: string;
    data?: unknown;
  }>;
  readAt?: number;
  dismissedAt?: number;
}

/**
 * Notification instance
 */
export class Notification {
  private notificationId: string;
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  private cachedData: NotificationData | null = null;

  constructor(
    notificationId: string,
    data: NotificationData,
    syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>
  ) {
    this.notificationId = notificationId;
    this.cachedData = data;
    this.syscall = syscall;
  }

  get id(): string {
    return this.notificationId;
  }

  get title(): string {
    return this.cachedData?.title ?? '';
  }

  get message(): string {
    return this.cachedData?.message ?? '';
  }

  get priority(): 'low' | 'normal' | 'high' | 'urgent' {
    return this.cachedData?.priority ?? 'normal';
  }

  get status(): 'pending' | 'read' | 'dismissed' {
    return this.cachedData?.status ?? 'pending';
  }

  get createdAt(): number {
    return this.cachedData?.createdAt ?? 0;
  }

  get actions(): Array<{ label: string; action: string; data?: unknown }> {
    return this.cachedData?.actions ?? [];
  }

  async dismiss(): Promise<void> {
    await this.syscall('notification.dismiss', { id: this.notificationId });
    if (this.cachedData) {
      this.cachedData.status = 'dismissed';
      this.cachedData.dismissedAt = Date.now();
    }
  }

  async markAsRead(): Promise<void> {
    await this.syscall('notification.markAsRead', { id: this.notificationId });
    if (this.cachedData) {
      this.cachedData.status = 'read';
      this.cachedData.readAt = Date.now();
    }
  }
}

/**
 * Notification API factory
 */
export class NotificationAPI {
  private syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>;

  constructor(syscall: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
    this.syscall = syscall;
  }

  /**
   * Show a notification
   */
  async show(options: NotificationOptions): Promise<Notification> {
    const result = (await this.syscall('notification.create', { options })) as NotificationData;
    return new Notification(result.id, result, this.syscall);
  }

  /**
   * Dismiss a notification by ID
   */
  async dismiss(id: string): Promise<void> {
    await this.syscall('notification.dismiss', { id });
  }

  /**
   * Dismiss all notifications for this app
   */
  async dismissAll(): Promise<void> {
    await this.syscall('notification.dismissAll', {});
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await this.syscall('notification.markAsRead', { id });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await this.syscall('notification.markAllAsRead', {});
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    return (await this.syscall('notification.getUnreadCount', {})) as number;
  }

  /**
   * Get notifications
   */
  async getNotifications(filter?: 'all' | 'unread' | 'dismissed'): Promise<Notification[]> {
    const results = (await this.syscall('notification.getNotifications', {
      filter: filter ?? 'all',
    })) as NotificationData[];
    return results.map((data) => new Notification(data.id, data, this.syscall));
  }
}

