import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer } from 'better-auth/plugins';
import { sendMail } from '@/mail/mailer';
import { renderActionEmail } from '@/mail/templates';

const prisma = new PrismaClient();

const API_URL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? 'http://localhost:5173';

export const auth = betterAuth({
  baseURL: API_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [WEB_ORIGIN],
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  advanced: {
    database: {
      generateId: () => randomUUID(),
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const actionUrl = `${WEB_ORIGIN}/reset-password?token=${token}`;
      const mail = renderActionEmail({
        subject: 'Reset your Golf Practice password',
        heading: 'Reset your password',
        body: "Tap the button to choose a new password. If you didn't ask for this, you can ignore this email.",
        actionLabel: 'Reset password',
        actionUrl,
      });
      await sendMail({ to: user.email, subject: mail.subject, text: mail.text, html: mail.html });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const callback = encodeURIComponent(`${WEB_ORIGIN}/signin?verified=1`);
      const actionUrl = `${API_URL}/api/auth/verify-email?token=${token}&callbackURL=${callback}`;
      const mail = renderActionEmail({
        subject: 'Verify your Golf Practice email',
        heading: 'Confirm your email',
        body: 'Tap the button to verify your address, then sign in to start tracking your range sessions.',
        actionLabel: 'Verify email',
        actionUrl,
      });
      await sendMail({ to: user.email, subject: mail.subject, text: mail.text, html: mail.html });
    },
  },
  plugins: [bearer()],
});

export type Auth = typeof auth;
