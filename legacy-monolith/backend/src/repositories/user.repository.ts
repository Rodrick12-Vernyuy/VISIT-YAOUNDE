import { prisma } from '../config/prisma';

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  create(data: { fullName: string; email: string; passwordHash: string }) {
    return prisma.user.create({ data });
  },
  saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.create({ data: { userId, token, expiresAt } });
  },
  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
  },
  revokeRefreshToken(token: string) {
    return prisma.refreshToken.update({ where: { token }, data: { revokedAt: new Date() } });
  },
  updateProfile(id: string, data: { fullName: string }) {
    return prisma.user.update({ where: { id }, data });
  },
};
