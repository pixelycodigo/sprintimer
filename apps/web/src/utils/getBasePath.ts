/**
 * Obtiene la ruta base actual desde config.json (fuente de verdad)
 * Esto permite que las redirecciones funcionen correctamente
 * tanto en raíz como en subcarpetas
 *
 * IMPORTANTE: Cuando React Router tiene basename configurado,
 * las rutas internas NO deben usar buildPath(), solo usar para:
 * - window.location.href
 * - Enlaces externos
 * - Configuracion de API
 */

let cachedBasePath: string | null = null;

/**
 * Obtiene el basePath desde config.json (fuente de verdad)
 * Ejemplos:
 * - config.json baseUrl: "/" → ''
 * - config.json baseUrl: "/sprintask/" → '/sprintask'
 * - config.json baseUrl: "/app/" → '/app'
 */
export function getBasePath(): string {
  // Si ya está en caché, retornar
  if (cachedBasePath !== null) {
    return cachedBasePath;
  }

  // Leer desde variable global establecida en main.tsx
  const globalBaseUrl: string | undefined = (window as any).__APP_BASE_URL__;

  if (globalBaseUrl) {
    // Quitar slash final para consistencia
    cachedBasePath = globalBaseUrl.endsWith('/')
      ? globalBaseUrl.slice(0, -1)
      : globalBaseUrl;
    return cachedBasePath;
  }

  // Fallback: retornar string vacío si no hay configuración
  cachedBasePath = '';
  return cachedBasePath;
}

/**
 * Construye una ruta completa con el basePath actual
 * @param path - Ruta relativa (ej: '/login')
 * @returns Ruta completa (ej: '/sprintask/login' o '/login')
 */
export function buildPath(path: string): string {
  const basePath = getBasePath();
  
  // Asegurar que path comience con /
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  
  // Si no hay basePath, retornar la ruta normal
  if (!basePath) {
    return normalizedPath;
  }
  
  // Evitar doble slash
  const basePathNoSlash = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const pathNoSlash = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
  
  return `${basePathNoSlash}/${pathNoSlash}`;
}

/**
 * Obtiene la ruta de login correcta según el basePath actual
 */
export function getLoginPath(): string {
  return buildPath('/login');
}

/**
 * Limpia el caché del basePath (útil después de cambios de configuración)
 */
export function clearBasePathCache(): void {
  cachedBasePath = null;
}
