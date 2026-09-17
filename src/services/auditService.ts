import { apiClient } from '@/services/api/client';
import { ActivityLog } from '@/types';
import { useReportStore } from '@/stores/reportStore';
import { useAuthStore } from '@/stores/authStore';

export const auditService = {
  async log(
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>
  ): Promise<ActivityLog> {
    const currentUser = useAuthStore.getState().currentUser;
    const actorId = currentUser?.id || 'sys-auto';
    const actorName = currentUser?.name || 'Automated System';

    const entry = await apiClient.logAudit({
      actorId,
      actorName,
      action,
      entityType,
      entityId,
      metadata,
    });

    // Sync into report store in memory
    useReportStore.setState((state) => ({
      activityLogs: [entry, ...state.activityLogs],
    }));

    return entry;
  },

  async getRecentLogs(limit = 20): Promise<ActivityLog[]> {
    const logs = await apiClient.getAuditLogs();
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
};
