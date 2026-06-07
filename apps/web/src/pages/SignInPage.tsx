import { type FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';
import { signIn } from '@/lib/auth-client';

export function SignInPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const justVerified = params.get('verified') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn.email({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? t('auth.signIn'));
      return;
    }
    navigate('/');
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <h1 className="text-center text-3xl font-bold">{t('app.title')}</h1>
      <Card>
        <CardTitle>{t('auth.signIn')}</CardTitle>
        {justVerified ? <p className="mt-3 text-sm text-primary">{t('auth.verified')}</p> : null}
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" size="full" disabled={loading}>
            {t('auth.signIn')}
          </Button>
        </form>
      </Card>
      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
        <Link to="/signup">{t('auth.toSignUp')}</Link>
        <Link to="/forgot">{t('auth.forgot')}</Link>
      </div>
    </div>
  );
}
