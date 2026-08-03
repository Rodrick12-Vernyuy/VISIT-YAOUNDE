import { prisma } from '../src/config/prisma';

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}@test.visityaounde.cm`;
}

export async function cleanupTestUser(email: string) {
  await prisma.refreshToken.deleteMany({ where: { user: { email } } });
  await prisma.user.deleteMany({ where: { email } });
}
