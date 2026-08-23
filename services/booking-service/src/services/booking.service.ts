import { bookingRepository } from '../repositories/booking.repository';
import { attractionsClient } from '../clients/attractionsClient';
import { ApiError } from '../utils/ApiError';

async function getOwnedOrThrow(id: string, userId: string) {
  const booking = await bookingRepository.findOwned(id, userId);
  if (!booking) throw ApiError.notFound('Booking not found');
  return booking;
}

export const bookingService = {
  listForUser(userId: string) {
    return bookingRepository.findByUser(userId);
  },

  getOwned: getOwnedOrThrow,

  async create(
    userId: string,
    input: { attractionId: string; visitDate: string; numberOfPeople: number; notes?: string }
  ) {
    const visitDate = new Date(input.visitDate);
    if (visitDate < new Date()) throw ApiError.badRequest('visitDate must be in the future');

    const exists = await attractionsClient.attractionExists(input.attractionId);
    if (!exists) throw ApiError.notFound('Attraction not found');

    return bookingRepository.create(userId, {
      attractionId: input.attractionId,
      visitDate,
      numberOfPeople: input.numberOfPeople,
      notes: input.notes,
    });
  },

  async update(
    id: string,
    userId: string,
    input: Partial<{ visitDate: string; numberOfPeople: number; notes: string }>
  ) {
    const booking = await getOwnedOrThrow(id, userId);
    if (booking.status !== 'PENDING') throw ApiError.badRequest('Only pending bookings can be edited');

    return bookingRepository.update(id, {
      visitDate: input.visitDate ? new Date(input.visitDate) : undefined,
      numberOfPeople: input.numberOfPeople,
      notes: input.notes,
    });
  },

  async cancel(id: string, userId: string) {
    const booking = await getOwnedOrThrow(id, userId);
    if (booking.status === 'CANCELLED') return booking;
    return bookingRepository.setStatus(id, 'CANCELLED');
  },
};
