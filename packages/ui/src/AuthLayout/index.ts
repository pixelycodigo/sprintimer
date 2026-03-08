export { AuthLayout, AuthHeader, AuthContent, AuthFooter } from './AuthLayout';
export type { AuthLayoutProps } from './AuthLayout';

/**
 * AuthLayout con redirección automática según el rol del usuario
 * 
 * Uso:
 * ```tsx
 * // Redirección automática activada
 * <AuthLayout redirectByRole={true}>
 *   <LoginForm />
 * </AuthLayout>
 * 
 * // Sin redirección (por defecto)
 * <AuthLayout>
 *   <LoginForm />
 * </AuthLayout>
 * ```
 * 
 * Roles soportados:
 * - super_admin → /super-admin
 * - administrador → /admin
 * - talent → /talent
 * - cliente → /cliente
 */
