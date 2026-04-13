/** Stop-words em português — lista de ~130 termos comuns */
const STOP_WORDS = new Set([
  "a","ao","aos","aquela","aquelas","aquele","aqueles","aquilo","as","até",
  "com","como","da","das","de","dela","delas","dele","deles","depois","do",
  "dos","e","ela","elas","ele","eles","em","entre","era","eram","essa","essas",
  "esse","esses","esta","estas","este","estes","eu","foi","fomos","for","fora",
  "foram","há","isso","isto","já","lhe","lhes","mas","me","mesmo","meu","meus",
  "minha","minhas","muito","muitos","na","nas","nem","no","nos","nossa","nossas",
  "nosso","nossos","não","nós","num","numa","numas","nuns","o","os","ou","para",
  "pela","pelas","pelo","pelos","por","que","quando","quem","se","sem","seu",
  "seus","só","sua","suas","também","te","teu","teus","tua","tuas","tudo","um",
  "uma","umas","uns","você","vocês","vos","à","às","mais","menos","pode","podem",
  "deve","devem","ter","temos","tem","sendo","sido","ser","está","estão","são",
  "isso","nisto","nessa","nesse","outro","outros","outra","outras","cada",
  "todo","toda","todos","todas","qual","quais","onde","como","sobre","pela",
  "pelos","pelas","ainda","então","assim","aqui","ali","lá","cá","já","bem",
  "aquém","além","antes","depois","durante","enquanto","logo","porém","pois",
  "portanto","contudo","todavia","entretanto","portanto","tal","tais","tanto",
  "tanta","tantos","tantas","cujo","cuja","cujos","cujas","quando","quanto",
  "quanta","quantos","quantas","nenhum","nenhuma","algum","alguma","alguns",
  "algumas","muito","muita","pouco","pouca","poucos","poucas","certo","certa",
  "certos","certas","próprio","própria","próprios","próprias","mesmo","mesma",
  "mesmos","mesmas","via","vez","vezes","tipo","tipos","uso","usos","caso",
  "casos","parte","partes","item","itens","ponto","pontos","forma","formas",
]);

/** Remove markdown fences e extrai texto puro de conteúdo JSON da IA */
function extractPlainText(content: string): string {
  let s = content.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  try {
    const parsed = JSON.parse(s);
    if (typeof parsed === "string") return parsed;
    // Concatena todos os valores string de objetos aninhados
    return flattenValues(parsed);
  } catch {
    return content;
  }
}

function flattenValues(obj: unknown): string {
  if (typeof obj === "string") return obj;
  if (Array.isArray(obj)) return obj.map(flattenValues).join(" ");
  if (obj && typeof obj === "object") {
    return Object.values(obj as Record<string, unknown>).map(flattenValues).join(" ");
  }
  return "";
}

/**
 * Extrai as palavras-chave mais frequentes de um texto (ou array de textos).
 * Remove stop-words, filtra tokens com ≥4 chars, retorna top `topN`.
 */
export function extractKeywords(texts: string[], topN = 8): string[] {
  const combined = texts.map(extractPlainText).join(" ");

  const tokens = combined
    .toLowerCase()
    .match(/\b[a-záàâãéèêíïóôõúüç]{4,}\b/g) ?? [];

  const freq = new Map<string, number>();
  for (const token of tokens) {
    if (STOP_WORDS.has(token)) continue;
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}
