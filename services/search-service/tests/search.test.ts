import request from 'supertest';

const mockResult = { items: [{ id: 'a1', name: 'Mont Fébé' }], page: 1, pageSize: 12, total: 1, totalPages: 1 };

jest.mock('../src/clients/attractionsClient', () => ({
  attractionsClient: { search: jest.fn().mockResolvedValue(mockResult) },
}));

jest.mock('../src/config/redis', () => ({
  redis: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue('OK') },
}));

import { createApp } from '../src/app';
import { attractionsClient } from '../src/clients/attractionsClient';

const app = createApp();

describe('Search', () => {
  it('proxies a search request to attractions-service', async () => {
    const res = await request(app).get('/api/v1/search').query({ q: 'febe' });

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.cached).toBe(false);
    expect(attractionsClient.search).toHaveBeenCalledWith(expect.objectContaining({ q: 'febe' }));
  });

  it('rejects an invalid featured filter', async () => {
    const res = await request(app).get('/api/v1/search').query({ featured: 'maybe' });
    expect(res.status).toBe(400);
  });
});
