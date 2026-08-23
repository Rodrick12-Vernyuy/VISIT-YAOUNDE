import { prisma } from '../config/prisma';
import { NotificationType } from '@prisma/client';

export const notificationRepository = {
  findByUser(userId: string, { page, pageSize }: { page: number; pageSize: number }) {
    return prisma.$transaction([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
  },

  findOwned(id: string, userId: string) {
    return prisma.notification.findFirst({ where: { id, userId } });
  },

  create(data: { userId: string; type: NotificationType; title: string; message: string }) {
    return prisma.notification.create({ data });
  },

  markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  },

  delete(id: string) {
    return prisma.notification.delete({ where: { id } });
  },
};
