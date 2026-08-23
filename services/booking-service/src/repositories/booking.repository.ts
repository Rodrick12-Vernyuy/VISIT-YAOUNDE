import { prisma, BookingStatus } from '../config/prisma';

export const bookingRepository = {
  findByUser(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      orderBy: { visitDate: 'desc' },
    });
  },

  findOwned(id: string, userId: string) {
    return prisma.booking.findFirst({ where: { id, userId } });
  },

  create(userId: string, data: { attractionId: string; visitDate: Date; numberOfPeople: number; notes?: string }) {
    return prisma.booking.create({ data: { ...data, userId } });
  },

  update(id: string, data: Partial<{ visitDate: Date; numberOfPeople: number; notes: string }>) {
    return prisma.booking.update({ where: { id }, data });
  },

  setStatus(id: string, status: BookingStatus) {
    return prisma.booking.update({ where: { id }, data: { status } });
  },
};
