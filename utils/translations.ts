/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type LanguageCode = 'en' | 'fr' | 'es' | 'ru' | 'it' | 'de' | 'ar' | 'zh' | 'pt' | 'hi';

export const languageNameMap: Record<LanguageCode, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  ru: 'Russian',
  it: 'Italian',
  de: 'German',
  ar: 'Arabic',
  zh: 'Mandarin Chinese',
  pt: 'Portuguese',
  hi: 'Hindi',
};

type Translation = {
  search: string;
  recent: string;
  madeBy: string;
  generatedBy: string;
  save: string;
};

export const translations: Record<LanguageCode, Translation> = {
  en: {
    search: 'Search',
    recent: 'Recent',
    madeBy: 'Made by',
    generatedBy: 'Text by OpenRouter · Images by Pexels',
    save: 'Save',
  },
  it: {
    search: 'Cerca',
    recent: 'Recenti',
    madeBy: 'Creato da',
    generatedBy: 'Testo da OpenRouter · Immagini da Pexels',
    save: 'Salva',
  },
  fr: {
    search: 'Rechercher',
    recent: 'Récents',
    madeBy: 'Créé par',
    generatedBy: 'Texte par OpenRouter · Images par Pexels',
    save: 'Enregistrer',
  },
  es: {
    search: 'Buscar',
    recent: 'Recientes',
    madeBy: 'Hecho por',
    generatedBy: 'Texto de OpenRouter · Imágenes de Pexels',
    save: 'Guardar',
  },
  de: {
    search: 'Suchen',
    recent: 'Letzte',
    madeBy: 'Erstellt von',
    generatedBy: 'Text von OpenRouter · Bilder von Pexels',
    save: 'Speichern',
  },
  ru: {
    search: 'Поиск',
    recent: 'Недавние',
    madeBy: 'Сделано',
    generatedBy: 'Текст от OpenRouter · Изображения от Pexels',
    save: 'Сохранить',
  },
  ar: {
    search: 'بحث',
    recent: 'الأخيرة',
    madeBy: 'صنع من قبل',
    generatedBy: 'النص بواسطة OpenRouter · الصور بواسطة Pexels',
    save: 'حفظ',
  },
  zh: {
    search: '搜索',
    recent: '最近',
    madeBy: '由...制作',
    generatedBy: '文本由 OpenRouter 提供 · 图像由 Pexels 提供',
    save: '保存',
  },
  pt: {
    search: 'Pesquisar',
    recent: 'Recentes',
    madeBy: 'Feito por',
    generatedBy: 'Texto do OpenRouter · Imagens do Pexels',
    save: 'Salvar',
  },
  hi: {
    search: 'खोजें',
    recent: 'हाल का',
    madeBy: 'द्वारा बनाया गया',
    generatedBy: 'OpenRouter द्वारा टेक्स्ट · Pexels द्वारा छवियां',
    save: 'सहेजें',
  },
};
