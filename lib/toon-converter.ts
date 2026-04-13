/**
 * TOON Converter - JSON ↔ TOON (Token-Oriented Object Notation)
 *
 * Converte entre JSON e TOON para edição mais amigável pelo usuário.
 * TOON é 30-60% mais eficiente em tokens e muito mais legível que JSON.
 *
 * @see https://github.com/toon-format/toon
 *
 * ## Casos de uso principais
 * - `jsonToToon`: usar antes de exibir conteúdo gerado pela IA para o usuário editar
 * - `toonToJson`: usar antes de salvar edições do usuário no banco de dados
 * - `isValidToon`: usar para validar input antes de chamar `toonToJson`
 *
 * ## Edge cases tratados
 * - `null` / `undefined` → retorna string vazia (jsonToToon) ou `null` (toonToJson)
 * - String vazia → retorna string vazia sem lançar erro
 * - Array vazio `[]` → encode/decode lidam nativamente; fallback para `"[]"`
 * - Objetos profundamente aninhados → suportados nativamente pela biblioteca
 * - Input não-TOON em `toonToJson` → tenta JSON como fallback antes de retornar erro
 */

import { encode, decode } from '@toon-format/toon';

/**
 * Converte objeto JSON para formato TOON.
 *
 * @param json - Objeto JavaScript para converter (aceita null, undefined, arrays, primitivos)
 * @returns String no formato TOON; em caso de erro, retorna JSON.stringify como fallback
 *
 * @example
 * jsonToToon({ nome: 'Alice', idade: 30 })
 * // "nome: Alice\nidade: 30"
 *
 * jsonToToon([1, 2, 3])
 * // "[3]:\n  1\n  2\n  3"
 *
 * jsonToToon(null)  // → ""
 * jsonToToon({})    // → ""
 * jsonToToon([])    // → ""
 */
export function jsonToToon(json: unknown): string {
  // Tratar null/undefined explicitamente
  if (json === null || json === undefined) return '';

  // Tratar objetos e arrays vazios — encode pode produzir output inútil
  if (typeof json === 'object') {
    if (Array.isArray(json) && json.length === 0) return '';
    if (!Array.isArray(json) && Object.keys(json as object).length === 0) return '';
  }

  try {
    return encode(json);
  } catch (error) {
    console.error('[TOON Converter] Erro ao converter JSON para TOON:', error);
    // Fallback: retorna JSON stringificado formatado
    try {
      return JSON.stringify(json, null, 2);
    } catch {
      return String(json);
    }
  }
}

/**
 * Converte string TOON para objeto JavaScript.
 *
 * @param toonString - String no formato TOON (ou JSON como fallback)
 * @returns Objeto JavaScript parseado; em caso de erro retorna `{ error, raw }`
 *
 * @example
 * toonToJson("nome: Alice\nidade: 30")
 * // { nome: 'Alice', idade: 30 }
 *
 * toonToJson("")          // → null
 * toonToJson("  ")        // → null
 * toonToJson('{"a":1}')   // → { a: 1 } (fallback JSON)
 */
export function toonToJson(toonString: string): unknown {
  // Tratar string vazia/whitespace
  if (!toonString || !toonString.trim()) return null;

  try {
    return decode(toonString);
  } catch {
    // Fallback: tenta parsear como JSON (o usuário pode ter colado JSON)
    try {
      const cleaned = toonString
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      return JSON.parse(cleaned);
    } catch {
      // Último recurso: retorna objeto de erro estruturado
      return { error: 'Formato inválido', raw: toonString };
    }
  }
}

/**
 * Valida se uma string está no formato TOON válido.
 *
 * @param toonString - String para validar
 * @returns true se for TOON válido, false caso contrário
 *
 * @example
 * isValidToon("nome: Alice")  // → true
 * isValidToon("{invalido")    // → false
 * isValidToon("")             // → false
 */
export function isValidToon(toonString: string): boolean {
  if (!toonString || !toonString.trim()) return false;
  try {
    decode(toonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normaliza uma string TOON fazendo decode → encode para garantir formatação consistente.
 * Útil para remover indentação incorreta ou inconsistências de formato.
 *
 * @param toonString - String TOON para formatar
 * @returns String TOON normalizada; retorna o original se falhar
 */
export function formatToon(toonString: string): string {
  if (!toonString || !toonString.trim()) return toonString;
  try {
    const json = decode(toonString);
    return encode(json);
  } catch (error) {
    console.error('[TOON Converter] Erro ao formatar TOON:', error);
    return toonString;
  }
}
