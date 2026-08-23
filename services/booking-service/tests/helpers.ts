import jwt from 'jsonwebtoken';

export function tokenFor(userId: string, role: 'ADMIN' | 'USER' = 'USER') {
  return jwt.sign(
    { sub: userId, email: `${userId}@test.visityaounde.cm`, role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );
}
