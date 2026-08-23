import { prisma } from '../config/prisma';

export const itineraryRepository = {
  findByUser(userId: string) {
    return prisma.itinerary.findMany({
      where: { userId },
      orderBy: { startDate: 'asc' },
    });
  },

  findOwned(id: string, userId: string) {
    return prisma.itinerary.findFirst({
      where: { id, userId },
      include: { items: { orderBy: [{ dayNumber: 'asc' }, { order: 'asc' }] } },
    });
  },

  create(userId: string, data: { title: string; description?: string; startDate: Date; endDate: Date }) {
    return prisma.itinerary.create({ data: { ...data, userId } });
  },

  update(id: string, data: Partial<{ title: string; description: string; startDate: Date; endDate: Date }>) {
    return prisma.itinerary.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.itinerary.delete({ where: { id } });
  },

  addItem(itineraryId: string, data: { attractionId: string; dayNumber: number; order: number; notes?: string }) {
    return prisma.itineraryItem.create({ data: { ...data, itineraryId } });
  },

  findItem(id: string, itineraryId: string) {
    return prisma.itineraryItem.findFirst({ where: { id, itineraryId } });
  },

  updateItem(id: string, data: Partial<{ dayNumber: number; order: number; notes: string }>) {
    return prisma.itineraryItem.update({ where: { id }, data });
  },

  removeItem(id: string) {
    return prisma.itineraryItem.delete({ where: { id } });
  },
};
