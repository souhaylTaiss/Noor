// ==================== Data Service / API Layer ====================
import { QuranService } from "./quran.js";
import { HadithService } from "./hadith.js";
import { fetchUrl } from "./utils.js";
import { appState } from "./state.js";

const translationUrl = "./assets/script/translations.json";

export const dataServer = {
  quranData: () => QuranService.getQuranByLang(appState.language),
  hadithData: () =>
    HadithService.hadithData(
      appState.bookNumber,
      appState.hadithLang[appState.bookNumber - 1],
    ),
  translationsData: fetchUrl(translationUrl),
};
