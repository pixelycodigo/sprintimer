import { AuthPageLayout } from '@ui/AuthPageLayout';
import { RegisterForm } from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="SPRINTASK"
      subtitle="Crear cuenta de administrador"
      footer="© 2026 SprinTask. Todos los derechos reservados."
    >
      <RegisterForm />
    </AuthPageLayout>
  );
}
