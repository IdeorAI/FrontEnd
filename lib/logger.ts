// Logger condicional - apenas em desenvolvimento
const isDev = process.env.NODE_ENV === 'development';

export const log = {
  info: (...args: unknown[]) => isDev && console.log('[INFO]', ...args),
  warn: (...args: unknown[]) => isDev && console.warn('[WARN]', ...args),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args), // Erros sempre logados
  debug: (...args: unknown[]) => isDev && console.debug('[DEBUG]', ...args),
};
