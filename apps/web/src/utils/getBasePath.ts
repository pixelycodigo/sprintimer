/**
 * Obtiene la ruta base actual desde la URL del navegador
 * Esto permite que las redirecciones funcionen correctamente
 * tanto en raíz como en subcarpetas
 */

let cachedBasePath: string | null = null;

/**
 * Obtiene el basePath desde la URL actual
 * Ejemplos:
 * - https://dominio.com/ → ''
 * - https://dominio.com/sprintask/ → '/sprintask'
 * - https://dominio.com/app/ → '/app'
 */
export function getBasePath(): string {
  if (cachedBasePath !== null) {
    return cachedBasePath;
  }

  const pathname = window.location.pathname;
  
  // Si estamos en la raíz, retornar string vacío
  if (pathname === '/' || pathname === '/index.html') {
    cachedBasePath = '';
    return '';
  }

  // Obtener la primera parte del path
  // /sprintask/login → /sprintask
  // /app/admin → /app
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length === 0) {
    cachedBasePath = '';
    return '';
  }

  // Si es una ruta conocida (login, admin, talent, cliente, super-admin)
  // el basePath es la parte anterior
  const knownPaths = ['login', 'registro', 'admin', 'talent', 'cliente', 'super-admin'];
  
  // Si el primer segmento es una ruta conocida, estamos en raíz
  if (knownPaths.includes(parts[0])) {
    cachedBasePath = '';
    return '';
  }

  // De lo contrario, el basePath es el primer segmento
  cachedBasePath = '/' + parts[0];
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
