import { AuthPageLayout } from '@ui/AuthPageLayout';
import { LoginForm } from '../components/LoginForm';

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="SPRINTASK"
      subtitle="Gestión de proyectos freelance"
      footer="© 2026 SprinTask. Todos los derechos reservados."
    >
      <LoginForm />
    </AuthPageLayout>
  );
}
