import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardMuted, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/i18n';
import { type Language, LANGUAGES } from '@/i18n/translations';
import { clearToken } from '@/lib/api';
import { signOut, useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const LANGUAGE_LABELS: Record<Language, string> = { en: 'English', it: 'Italiano' };

export function ProfilePage() {
  const { t, language, setLanguage } = useI18n();
  const { data } = useSession();
  const navigate = useNavigate();

  async function onSignOut() {
    await signOut();
    clearToken();
    navigate('/signin');
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

      <Card>
        <CardTitle>{t('profile.language')}</CardTitle>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {LANGUAGES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLanguage(option)}
              className={cn(
                'min-h-12 rounded-xl border px-3 font-medium',
                option === language
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-foreground'
              )}>
              {LANGUAGE_LABELS[option]}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardMuted>{data?.user.email}</CardMuted>
        <Button className="mt-3" variant="outline" size="full" onClick={onSignOut}>
          {t('auth.signOut')}
        </Button>
      </Card>
    </div>
  );
}
