import jwt from 'jsonwebtoken';
import { prisma } from '../src/config/prisma';

export function adminToken(userId = 'test-admin-id') {
  return jwt.sign(
    { sub: userId, email: 'admin@test.visityaounde.cm', role: 'ADMIN' },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );
}

export function userToken(userId = 'test-user-id') {
  return jwt.sign(
    { sub: userId, email: 'user@test.visityaounde.cm', role: 'USER' },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );
}

export async function ensureCategory() {
  return prisma.category.upsert({
    where: { slug: 'test-category' },
    update: {},
    create: { name: 'Test Category', slug: 'test-category' },
  });
}
