import { validateEnv } from '@/config/env.validation';

const base = {
  DATABASE_URL: 'postgresql://golf:golf@localhost:5432/golf',
  BETTER_AUTH_SECRET: 'a-sufficiently-long-secret',
};

describe('validateEnv', () => {
  it('applies defaults for optional variables', () => {
    const env = validateEnv(base);
    expect(env.NODE_ENV).toBe('development');
    expect(env.API_PORT).toBe(3000);
    expect(env.BETTER_AUTH_URL).toBe('http://localhost:3000');
  });

  it('coerces numeric strings', () => {
    const env = validateEnv({ ...base, API_PORT: '4000' });
    expect(env.API_PORT).toBe(4000);
  });

  it('throws when a required variable is missing', () => {
    expect(() => validateEnv({ BETTER_AUTH_SECRET: 'a-sufficiently-long-secret' })).toThrow(
      /DATABASE_URL/
    );
  });

  it('throws when a secret is too short', () => {
    expect(() => validateEnv({ ...base, BETTER_AUTH_SECRET: 'short' })).toThrow(
      /BETTER_AUTH_SECRET/
    );
  });
});
