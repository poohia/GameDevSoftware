import { AssertAcceptedType } from './types';

export const formatBase64 = (type: AssertAcceptedType, base64: string) => {
  switch (type) {
    case 'image':
      return `data:image/png;base64,${base64}`;
    case 'sound':
      return `data:audio/mpeg;base64,${base64}`;
    case 'video':
      return `data:video/mp4;base64,${base64}`;
    case 'json':
      return base64;
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
