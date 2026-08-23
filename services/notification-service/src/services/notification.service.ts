import { NotificationType } from '../config/prisma';
import { notificationRepository } from '../repositories/notification.repository';
import { ApiError } from '../utils/ApiError';

export const notificationService = {
  async listForUser(userId: string, page: number, pageSize: number) {
    const [items, total] = await notificationRepository.findByUser(userId, { page, pageSize });
    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  },

  create(input: { userId: string; type: NotificationType; title: string; message: string }) {
    return notificationRepository.create(input);
  },

  async markRead(id: string, userId: string) {
    const notification = await notificationRepository.findOwned(id, userId);
    if (!notification) throw ApiError.notFound('Notification not found');
    return notificationRepository.markRead(id);
  },

  markAllRead(userId: string) {
    return notificationRepository.markAllRead(userId);
  },

  async remove(id: string, userId: string) {
    const notification = await notificationRepository.findOwned(id, userId);
    if (!notification) throw ApiError.notFound('Notification not found');
    await notificationRepository.delete(id);
  },
};
