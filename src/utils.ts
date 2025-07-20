import { AssertAcceptedType, MIME_TYPE_MAP } from './types';

/**
 * Formate une chaîne base64 en une Data URL complète.
 * Tente d'abord de déduire le type MIME précis à partir du nom du fichier (s'il est fourni).
 * Si cela échoue, utilise le type générique comme solution de repli.
 *
 * @param type Le type générique de l'asset ('image', 'sound', etc.).
 * @param base64 La chaîne de données encodée en base64.
 * @param name Le nom de fichier optionnel (ex: "mon-image.svg").
 * @returns La Data URL formatée, ou la chaîne base64 brute pour le JSON.
 */
export const formatBase64 = (
  type: AssertAcceptedType,
  base64: string,
  name?: string
): string => {
  // --- 1. Tenter de déduire le type à partir du nom du fichier (logique prioritaire) ---
  if (name) {
    // Extrait la dernière partie après le point et la met en minuscules.
    const extension = name.split('.').pop()?.toLowerCase();

    if (extension) {
      const mimeType = MIME_TYPE_MAP[extension];
      // Si on a trouvé une correspondance, on l'utilise et on arrête la fonction ici.
      if (mimeType) {
        return `data:${mimeType};base64,${base64}`;
      }
    }
  }

  // --- 2. Si la déduction a échoué (pas de nom, ou extension inconnue), utiliser la logique de fallback ---
  // console.log(`Déduction par nom de fichier échouée pour "${name}", utilisation du type générique "${type}".`);

  switch (type) {
    case 'image':
      // Le type générique 'image' utilise 'png' par défaut.
      return `data:image/png;base64,${base64}`;
    case 'sound':
      // Le type générique 'sound' utilise 'mpeg' (mp3) par défaut.
      return `data:audio/mpeg;base64,${base64}`;
    case 'video':
      // Le type générique 'video' utilise 'mp4' par défaut.
      return `data:video/mp4;base64,${base64}`;
    case 'json':
      return base64;
    // Pas de 'default' nécessaire car le type est contraint par AssertAcceptedType
  }
};

export const reorderByLanguage = (
  obj: Record<string, any[]>,
  locale: string
): Record<string, any[]> => {
  if (obj[locale]) {
    const reordered: Record<string, any[]> = { [locale]: obj[locale] };
    for (const key in obj) {
      if (key !== locale) {
        reordered[key] = obj[key];
      }
    }
    return reordered;
  }
  return obj;
};
