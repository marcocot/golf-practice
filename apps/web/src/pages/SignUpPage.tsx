import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';
import { signUp } from '@/lib/auth-client';

export function SignUpPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    // BetterAuth requires a name; we don't ask for one, so derive it from the email.
    const result = await signUp.email({ name: email.split('@')[0] ?? email, email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? t('auth.signUp'));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-4 py-10">
        <h1 className="text-center text-3xl font-bold">{t('app.title')}</h1>
        <Card>
          <CardTitle>{t('auth.signUp')}</CardTitle>
          <CardMuted className="mt-4">{t('auth.checkEmail')}</CardMuted>
        </Card>
        <div className="flex justify-center text-sm text-muted-foreground">
          <Link to="/signin">{t('auth.toSignIn')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <h1 className="text-center text-3xl font-bold">{t('app.title')}</h1>
      <Card>
        <CardTitle>{t('auth.signUp')}</CardTitle>
        <form className="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="full" disabled={loading}>
            {t('auth.signUp')}
          </Button>
        </form>
      </Card>
      <div className="flex justify-center text-sm text-muted-foreground">
        <Link to="/signin">{t('auth.toSignIn')}</Link>
      </div>
    </div>
  );
}
