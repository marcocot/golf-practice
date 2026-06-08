import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { AuthGate } from '@/components/AuthGate';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { GuidePage } from '@/pages/GuidePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ProgressPage } from '@/pages/ProgressPage';
import { RulesPage } from '@/pages/RulesPage';
import { SignInPage } from '@/pages/SignInPage';
import { SkillTestsPage } from '@/pages/SkillTestsPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { TrainPage } from '@/pages/TrainPage';

export function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<AuthGate />}>
        <Route element={<AppLayout />}>
          <Route index element={<TrainPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/skill-tests" element={<SkillTestsPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
