import { apiFetch } from './client';

export interface AxisNotification {
  id: string;
  recipient: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  incident_id?: string;
  read: boolean;
  created_at: string;
}

export async function fetchNotifications(unreadOnly = false): Promise<AxisNotification[]> {
  return apiFetch<AxisNotification[]>(`/api/notifications${unreadOnly ? '?unread_only=true' : ''}`, []);
}

export async function markNotificationRead(id: string): Promise<AxisNotification> {
  const result = await apiFetch<AxisNotification | null>(`/api/notifications/${encodeURIComponent(id)}/read`, null, { method: 'POST' });
  if (!result) throw new Error('Notification service unavailable');
  return result;
}
