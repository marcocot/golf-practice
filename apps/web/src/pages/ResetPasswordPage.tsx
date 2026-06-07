import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';
import { resetPassword } from '@/lib/auth-client';

export function ResetPasswordPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    const result = await resetPassword({ newPassword: password, token });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? t('auth.resetTitle'));
      return;
    }
    setDone(true);
  }

  function shell(body: ReactNode) {
    return (
      <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-4 py-10">
        <h1 className="text-center text-3xl font-bold">{t('app.title')}</h1>
        <Card>
          <CardTitle>{t('auth.resetTitle')}</CardTitle>
          {body}
        </Card>
        <div className="flex justify-center text-sm text-muted-foreground">
          <Link to="/signin">{t('auth.toSignIn')}</Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return shell(<CardMuted className="mt-4">{t('auth.resetInvalid')}</CardMuted>);
  }
  if (done) {
    return shell(<CardMuted className="mt-4">{t('auth.resetDone')}</CardMuted>);
  }

  return shell(
    <form className="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">{t('auth.newPassword')}</Label>
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
        {t('common.save')}
      </Button>
    </form>
  );
}
