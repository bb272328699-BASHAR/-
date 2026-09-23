/**
 * Arabic Text Normalization & High-Efficiency Search Engine Helpers
 * Designed for Arabic NLP, prefix removal (ال, ب, ك, ل, و), diacritic removal,
 * alef/yaa/marbouta unification, and fuzzy relevance scoring.
 */

/**
 * Strips Arabic diacritics (tashkeel & tanween)
 */
export function removeDiacritics(text: string): string {
  if (!text) return '';
  return text.replace(/[\u064B-\u0652\u0670]/g, '');
}

/**
 * Normalizes Arabic letters to canonical forms:
 * - أ, إ, آ -> ا
 * - ة -> ه
 * - ى -> ي
 * - ؤ, ئ -> ء
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  let normalized = removeDiacritics(text.toLowerCase());

  // Alef forms
  normalized = normalized.replace(/[أإآٱ]/g, 'ا');
  // Taa marbouta
  normalized = normalized.replace(/ة/g, 'ه');
  // Alif maqsura
  normalized = normalized.replace(/ى/g, 'ي');
  // Hamza forms
  normalized = normalized.replace(/[ؤئ]/g, 'ء');
  // Tatweel
  normalized = normalized.replace(/ـ/g, '');

  return normalized.trim();
}

/**
 * Strips common Arabic prefixes (ال التعريف, و, ب, ك, ل)
 */
export function stripArabicPrefixes(word: string): string {
  if (!word || word.length <= 3) return word;
  
  let result = word;
  // Remove 'ال'
  if (result.startsWith('ال') && result.length > 3) {
    result = result.slice(2);
  }
  // Remove leading 'و' or 'ف' or 'ب' if followed by 'ال'
  if ((result.startsWith('وال') || result.startsWith('فال') || result.startsWith('بال') || result.startsWith('كال') || result.startsWith('لال')) && result.length > 4) {
    result = result.slice(3);
  }

  return result;
}

/**
 * Tokenizes and normalizes a search query into clean terms
 */
export function tokenizeQuery(queryStr: string): string[] {
  if (!queryStr) return [];
  const normalized = normalizeArabic(queryStr);
  const words = normalized.split(/[\s,._\-\/\\()\[\]"']+/).filter(Boolean);
  
  const tokens = new Set<string>();
  for (const w of words) {
    if (w.length >= 2) {
      tokens.add(w);
      const stripped = stripArabicPrefixes(w);
      if (stripped.length >= 2) {
        tokens.add(stripped);
      }
    }
  }

  return Array.from(tokens);
}

/**
 * Calculates a search relevance score for a target object based on query terms
 */
export function calculateRelevanceScore(
  item: {
    name?: string;
    slug?: string;
    tagline?: string;
    description?: string;
    categoryNames?: string[];
    pricing_type?: string;
    rating?: number;
    review_count?: number;
    views_count?: number;
    is_trending?: boolean;
    is_popular?: boolean;
  },
  queryStr: string
): number {
  if (!queryStr || !queryStr.trim()) return 0;

  const normQuery = normalizeArabic(queryStr);
  const tokens = tokenizeQuery(queryStr);

  const normName = normalizeArabic(item.name || '');
  const normSlug = normalizeArabic(item.slug || '');
  const normTagline = normalizeArabic(item.tagline || '');
  const normDesc = normalizeArabic(item.description || '');
  const normCats = (item.categoryNames || []).map(normalizeArabic).join(' ');

  let score = 0;

  // 1. Exact or prefix match on Name (highest priority)
  if (normName === normQuery) score += 100;
  else if (normName.startsWith(normQuery)) score += 80;
  else if (normName.includes(normQuery)) score += 60;

  // 2. Exact match on Slug
  if (normSlug === normQuery) score += 70;
  else if (normSlug.includes(normQuery)) score += 40;

  // 3. Match in Tagline & Categories
  if (normTagline.includes(normQuery)) score += 35;
  if (normCats.includes(normQuery)) score += 30;

  // 4. Token-level matching
  for (const token of tokens) {
    if (normName.includes(token)) score += 20;
    if (normTagline.includes(token)) score += 12;
    if (normCats.includes(token)) score += 10;
    if (normDesc.includes(token)) score += 5;
  }

  // 5. Popularity / Quality boost
  if (score > 0) {
    if (item.is_trending) score += 8;
    if (item.is_popular) score += 5;
    if (item.rating) score += Math.min(item.rating * 2, 10);
    if (item.review_count) score += Math.min(item.review_count * 0.1, 5);
  }

  return score;
}
