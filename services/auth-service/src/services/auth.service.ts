import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';
import { notificationClient } from '../clients/notificationClient';

function toAuthUser(user: { id: string; email: string; fullName: string; role: 'ADMIN' | 'USER'; avatarUrl: string | null }) {
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role, avatarUrl: user.avatarUrl };
}

async function issueTokens(user: { id: string; email: string; role: 'ADMIN' | 'USER' }) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  const expiresAt = new Date(Date.now() + env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000);
  await userRepository.saveRefreshToken(user.id, refreshToken, expiresAt);
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: { fullName: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await userRepository.create({ fullName: input.fullName, email: input.email, passwordHash });
    const tokens = await issueTokens(user);
    void notificationClient.sendWelcome(user.id);
    return { user: toAuthUser(user), ...tokens };
  },

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email);
    if (!user?.passwordHash) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    const tokens = await issueTokens(user);
    return { user: toAuthUser(user), ...tokens };
  },

  async refresh(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const stored = await userRepository.findRefreshToken(refreshToken);
    if (!stored || stored.revokedAt || stored.userId !== payload.sub || stored.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token is no longer valid');
    }

    await userRepository.revokeRefreshToken(refreshToken);
    const tokens = await issueTokens(stored.user);
    return { user: toAuthUser(stored.user), ...tokens };
  },

  async logout(refreshToken: string) {
    const stored = await userRepository.findRefreshToken(refreshToken);
    if (stored && !stored.revokedAt) {
      await userRepository.revokeRefreshToken(refreshToken);
    }
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return toAuthUser(user);
  },

  async updateProfile(userId: string, input: { fullName: string }) {
    const user = await userRepository.updateProfile(userId, input);
    return toAuthUser(user);
  },
};
