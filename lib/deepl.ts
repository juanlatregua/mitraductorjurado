import * as deepl from "deepl-node";

let translator: deepl.Translator | null = null;

function getTranslator(): deepl.Translator | null {
  if (!process.env.DEEPL_API_KEY) return null;
  if (!translator) {
    translator = new deepl.Translator(process.env.DEEPL_API_KEY);
  }
  return translator;
}

// Mapeo ISO 639-1 → código DeepL (DeepL usa códigos específicos para algunos idiomas)
const DEEPL_LANG_MAP: Record<string, string> = {
  en: "EN-US",
  pt: "PT-PT",
  zh: "ZH-HANS",
};

function toDeepLLang(isoCode: string): string {
  return DEEPL_LANG_MAP[isoCode] || isoCode.toUpperCase();
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  const t = getTranslator();
  if (!t) return null;

  try {
    const result = await t.translateText(
      text,
      toDeepLLang(sourceLang) as deepl.SourceLanguageCode,
      toDeepLLang(targetLang) as deepl.TargetLanguageCode
    );
    return result.text;
  } catch (error) {
    console.error("DeepL translation error:", error);
    return null;
  }
}

export async function translateSegments(
  segments: string[],
  sourceLang: string,
  targetLang: string
): Promise<(string | null)[]> {
  const t = getTranslator();
  if (!t) return segments.map(() => null);

  try {
    const results = await t.translateText(
      segments,
      toDeepLLang(sourceLang) as deepl.SourceLanguageCode,
      toDeepLLang(targetLang) as deepl.TargetLanguageCode
    );
    return results.map((r) => r.text);
  } catch (error) {
    console.error("DeepL batch translation error:", error);
    return segments.map(() => null);
  }
}

export function isDeepLConfigured(): boolean {
  return !!process.env.DEEPL_API_KEY;
}
