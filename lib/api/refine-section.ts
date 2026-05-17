import { authHeaders } from '@/lib/api/auth-headers';

/**
 * @deprecated Use `authHeaders()` de `@/lib/api/auth-headers` diretamente.
 * Mantido como re-export para compatibilidade com chamadas existentes.
 */
export const refineSectionAuthHeaders = authHeaders;
