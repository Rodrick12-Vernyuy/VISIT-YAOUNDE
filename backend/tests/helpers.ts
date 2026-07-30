import { prisma } from '../src/config/prisma';

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}@test.visityaounde.cm`;
}

export async function cleanupTestUser(email: string) {
  await prisma.refreshToken.deleteMany({ where: { user: { email } } });
  await prisma.user.deleteMany({ where: { email } });
}

export async function createAdmin() {
  const bcrypt = await import('bcryptjs');
  const email = uniqueEmail('admin');
  const user = await prisma.user.create({
    data: {
      email,
      fullName: 'Test Admin',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('AdminPass123!', 12),
    },
  });
  return { user, email, password: 'AdminPass123!' };
}

export async function ensureCategory() {
  return prisma.category.upsert({
    where: { slug: 'test-category' },
    update: {},
    create: { name: 'Test Category', slug: 'test-category' },
  });
}

export async function createUser() {
  const bcrypt = await import('bcryptjs');
  const email = uniqueEmail('user');
  const user = await prisma.user.create({
    data: {
      email,
      fullName: 'Test User',
      role: 'USER',
      passwordHash: await bcrypt.hash('UserPass123!', 12),
    },
  });
  return { user, email, password: 'UserPass123!' };
}

export async function createTestAttraction(categoryId: string, createdById: string) {
  const slug = `test-attraction-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  return prisma.attraction.create({
    data: {
      name: slug,
      slug,
      shortDescription: 'A short description for testing purposes.',
      description: 'A longer description used for automated testing.',
      district: 'Centre-ville',
      address: '123 Test Street',
      latitude: 3.86,
      longitude: 11.52,
      openingHours: '9am - 5pm',
      entryFee: 'Free',
      category: { connect: { id: categoryId } },
      createdBy: { connect: { id: createdById } },
    },
  });
}
