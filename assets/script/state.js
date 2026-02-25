// ==================== App State & Config ====================

export const bookOptions = {
  quran: [
    { content: "الصور", data: "chapters" },
    { content: "الاجزاء", data: "juzs" },
    { content: "الصفحات", data: "pages" },
    { content: "الايات", data: "verses" },
  ],
  hadith: [
    { content: "الكتب", data: "Books" },
    { content: "الفصول", data: "sections" },
    { content: "الاحاديث", data: "Hadiths" },
  ],
};

export const appState = {
  isItQuran: true,
  siteLang: localStorage.siteLanguage || "ar",
  dir: localStorage.siteLanguage === "en" ? "ltr" : "rtl",
  language: localStorage.bookLanguage || "ara_quranwarsh",
  hadithLang: JSON.parse(localStorage.hadithLang || "false") || {
    0: "ara-abudawud",
    1: "ara-bukhari",
    2: "ara-dehlawi",
    3: "ara-ibnmajah",
    4: "ara-malik",
    5: "ara-muslim",
    6: "ara-nasai",
    7: "ara-nawawi",
    8: "ara-qudsi",
    9: "ara-tirmidhi",
  },
  direction: localStorage.languageDirection || "rtl",
  fontSize: +localStorage.step + 30 || 30,
  step: localStorage.step || 1,
  maxStep: 10,
  minStep: 1,
  intervalId: null,
  countdownId: null,
  isGenerating: false,
  generateHandler: null,
  autoGenerateHandler: null,
  bookNumber: null, // set in main.js after UI is ready
};

// helpers
export const isArabic = () => appState.siteLang === "ar";
export const getLangKey = (ar, en) => isArabic() ? ar : en;
