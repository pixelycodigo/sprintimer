import { AuthPageLayout } from '@ui/AuthPageLayout';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout
      title="SPRINTASK"
      subtitle="Recuperar contraseña"
      footer="© 2026 SprinTask. Todos los derechos reservados."
    >
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}
