// ==================== Quote Generator ====================
import { UI } from "./elements.js";
import { appState } from "./state.js";
import { showLoading, hideLoading } from "./loading.js";
import { QuranService } from "./quran.js";
import { HadithService } from "./hadith.js";

const counter = UI.shrinkingBar.querySelector("div");

export async function generateQuoteFromJson(data, translations) {
  
  await generate(data, translations);

  if (appState.generateHandler) {
    UI.generateBtn.removeEventListener("click", appState.generateHandler);
  }
  if (appState.autoGenerateHandler) {
    UI.autoGenerateBtn.removeEventListener("click", appState.autoGenerateHandler);
  }

  appState.generateHandler = () => {
    stopAutoGenerating();
    generate(data, translations);
  };
  appState.autoGenerateHandler = () => autoGenerateQuote(data, translations);

  UI.generateBtn.addEventListener("click", appState.generateHandler);
  UI.autoGenerateBtn.addEventListener("click", appState.autoGenerateHandler);
}

export async function autoGenerateQuote(data, translations) {
  UI.pausePlayIcon.classList.toggle("pause-play");

  if (appState.isGenerating) {
    stopAutoGenerating();
    return;
  }

  appState.isGenerating = true;
  await startCycle(data, translations);
}

async function startCycle(data, translations) {
  await generate(data, translations);
  const readingTime = getReadingTime(UI.quoteText.innerHTML);
  restartAnimation(readingTime);
  startCountdown(readingTime);

  clearTimeout(appState.intervalId);
  appState.intervalId = setTimeout(async () => {
    if (!appState.isGenerating) return;
    await startCycle(data, translations);
  }, readingTime * 1000);
}

function restartAnimation(readingTime) {
  UI.shrinkingBar.classList.remove("running");
  void UI.shrinkingBar.offsetWidth;
  UI.shrinkingBar.style.animationDuration = readingTime + "s";
  UI.shrinkingBar.classList.add("running");
}

function startCountdown(readingTime) {
  clearInterval(appState.countdownId);
  counter.innerHTML = readingTime;

  appState.countdownId = setInterval(() => {
    readingTime--;
    counter.innerHTML = readingTime;
    if (readingTime <= 0) clearInterval(appState.countdownId);
  }, 1000);
}

export function stopAutoGenerating() {
  clearTimeout(appState.intervalId);
  clearInterval(appState.countdownId);
  UI.shrinkingBar.classList.remove("running");
  counter.innerHTML = "";
  appState.isGenerating = false;
}

async function generate(data, translations) {
  UI.quoteText.style.opacity = 0;
  UI.quoteDetails.style.opacity = 0;
  showLoading(UI.quoteText.parentElement);

  await new Promise((resolve) => setTimeout(resolve, 500));

  let randomText;
  if (appState.isItQuran) {
    randomText = QuranService.getRandomVerse(data);
    UI.quoteText.innerHTML = randomText.verseText;
    UI.quoteDetails.innerHTML = `${randomText.ayah} ${randomText.verseNumber} ${randomText.surah} ${randomText.surahName}`;
  } else {
    randomText = HadithService.getRandomHadith(data.hadiths);
    let isArabic = appState.hadithLang[appState.bookNumber - 1].startsWith("ar");
    const bookName = translations[isArabic ? "ar" : "en"].hadith.booksName[appState.bookNumber - 1];
    UI.quoteText.innerHTML = randomText.hadith;
    UI.quoteDetails.innerHTML = `${isArabic ? "حديث" : "Hadith"} ${randomText.hadithNumber}, ${bookName}`;
  }

  hideLoading(UI.quoteText.parentElement);
  UI.quoteText.style.opacity = 1;
  UI.quoteDetails.style.opacity = 1;

  return randomText;
}

function getReadingTime(text) {
  const wordsPerMinute = appState.siteLang === "ar" ? 200 : 250;
  const words = text.trim().split(/\s+/).length;
  const seconds = Math.ceil((words / wordsPerMinute) * 60);
  return Math.max(seconds, 3);
}
