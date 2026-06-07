import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/i18n';
import { requestPasswordReset } from '@/lib/auth-client';

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    await requestPasswordReset({ email, redirectTo: '/signin' });
    setLoading(false);
    setDone(true);
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <h1 className="text-center text-3xl font-bold">{t('app.title')}</h1>
      <Card>
        <CardTitle>{t('auth.forgot')}</CardTitle>
        {done ? (
          <CardMuted className="mt-4">{t('auth.resetSent')}</CardMuted>
        ) : (
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
            <Button type="submit" size="full" disabled={loading}>
              {t('common.save')}
            </Button>
          </form>
        )}
      </Card>
      <div className="flex justify-center text-sm text-muted-foreground">
        <Link to="/signin">{t('auth.toSignIn')}</Link>
      </div>
    </div>
  );
}
