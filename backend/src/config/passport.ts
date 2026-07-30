import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { prisma } from './prisma';

export function configurePassport() {
  if (!env.google.enabled) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Google account has no email'));
          }

          const user = await prisma.user.upsert({
            where: { email },
            update: { googleId: profile.id, avatarUrl: profile.photos?.[0]?.value },
            create: {
              email,
              fullName: profile.displayName,
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value,
            },
          });

          return done(null, { sub: user.id, email: user.email, role: user.role });
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}
