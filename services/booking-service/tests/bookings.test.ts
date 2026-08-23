import request from 'supertest';

jest.mock('../src/clients/attractionsClient', () => ({
  attractionsClient: {
    attractionExists: jest.fn().mockResolvedValue(true),
  },
}));

import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { tokenFor } from './helpers';

const app = createApp();
const attractionId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

describe('Bookings', () => {
  const userId = 'booking-user-1';
  const token = tokenFor(userId);
  let bookingId: string;

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { userId } });
    await prisma.$disconnect();
  });

  it('rejects listing bookings without auth', async () => {
    const res = await request(app).get('/api/v1/bookings');
    expect(res.status).toBe(401);
  });

  it('creates a booking', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ attractionId, visitDate: '2027-01-15', numberOfPeople: 2 });

    expect(res.status).toBe(201);
    expect(res.body.booking.status).toBe('PENDING');
    bookingId = res.body.booking.id;
  });

  it('cancels the booking', async () => {
    const res = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('CANCELLED');
  });
});
