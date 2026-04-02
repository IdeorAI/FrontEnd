/**
 * TOON Converter - JSON ↔ TOON (Token-Oriented Object Notation)
 *
 * Converte entre JSON e TOON para edição mais amigável pelo usuário.
 * TOON é 30-60% mais eficiente em tokens e muito mais legível que JSON.
 *
 * @see https://github.com/toon-format/toon
 */

import { encode, decode } from '@toon-format/toon';

/**
 * Converte objeto JSON para formato TOON
 *
 * @param json - Objeto JavaScript para converter
 * @returns String no formato TOON
 *
 * @example
 * const json = { users: [{ id: 1, name: 'Alice' }] };
 * const toon = jsonToToon(json);
 * // users[1]{id,name}:
 * //   1,Alice
 */
export function jsonToToon(json: unknown): string {
  try {
    return encode(json);
  } catch (error) {
    console.error('[TOON Converter] Erro ao converter JSON para TOON:', error);
    // Fallback: retorna JSON stringificado formatado
    return JSON.stringify(json, null, 2);
  }
}

/**
 * Converte string TOON para objeto JSON
 *
 * @param toonString - String no formato TOON
 * @returns Objeto JavaScript parseado
 *
 * @example
 * const toon = 'users[1]{id,name}:\n  1,Alice';
 * const json = toonToJson(toon);
 * // { users: [{ id: 1, name: 'Alice' }] }
 */
export function toonToJson(toonString: string): unknown {
  try {
    return decode(toonString);
  } catch (error) {
    console.error('[TOON Converter] Erro ao converter TOON para JSON:', error);
    // Fallback: tenta parsear como JSON
    try {
      return JSON.parse(toonString);
    } catch {
      // Se falhar, retorna objeto com mensagem de erro
      return { error: 'Formato inválido', raw: toonString };
    }
  }
}

/**
 * Valida se uma string está no formato TOON válido
 *
 * @param toonString - String para validar
 * @returns true se for TOON válido, false caso contrário
 */
export function isValidToon(toonString: string): boolean {
  try {
    decode(toonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formata string TOON com indentação consistente
 * (a biblioteca já faz isso, mas esta função garante formato consistente)
 *
 * @param toonString - String TOON para formatar
 * @returns String TOON formatada
 */
export function formatToon(toonString: string): string {
  try {
    const json = decode(toonString);
    return encode(json);
  } catch (error) {
    console.error('[TOON Converter] Erro ao formatar TOON:', error);
    return toonString; // Retorna original se falhar
  }
}
