// ==================== Main Entry Point ====================
import { getAllFonts } from "./fonts.js";
import { QuranService } from "./quran.js";
import { HadithService } from "./hadith.js";

import { UI, createElements, activateElement } from "./elements.js";
import { appState, bookOptions } from "./state.js";
import { dataServer } from "./data.js";
import { showLoading, hideLoading } from "./loading.js";
import { createArticle, createTextBook } from "./article.js";
import { createListInSidebar, addBookOptions, subBox } from "./sidebar.js";
import { handleSearch } from "./sidebar.js";
import { handleSiteLang, setLanguage, changeLanguage } from "./language.js";
import { generateQuoteFromJson } from "./quote.js";
import { getQuranPart, showHadithPart } from "./article.js";
import { isArabic } from "./state.js";
import { fetchUrl } from "./utils.js";

const body = document.body;
const scrollToTop = () => window.scrollTo(0, 0);

// ---- Init state that depends on UI ----
appState.bookNumber = UI.articleContainer.dataset.number || 1;

// ---- Font setup ----
let elementsFont = document.querySelectorAll(".font-family");
let styleElement = document.createElement("style");
document.head.append(styleElement);

// ---- Persist hadithLang ----
if (!localStorage.hadithLang) {
  localStorage.hadithLang = JSON.stringify(appState.hadithLang);
}

// ---- Font size init ----
const isMobile = window.innerWidth < 768;
if (isMobile) appState.fontSize = Math.ceil(appState.fontSize * 0.6);

UI.fontSizeIncrease.nextElementSibling.innerHTML = appState.step;
UI.quoteText.style.fontSize = `${appState.fontSize}px`;
UI.articleContainer.style.fontSize = `${appState.fontSize}px`;
UI.articleContainer.style.maxWidth = `${700 + appState.step * 30}px`;

// ==================== Show Book ====================
export async function showBook(btn) {
  let dataNumber = +btn.dataset.number;
  let isItArabic = true;

  showLoading(body);
  scrollToTop();
  UI.main.classList.add("hidden");
  UI.leftSidebar.classList.remove("active");

  if (appState.isItQuran) {
    const quranData = await dataServer.quranData();
    const chaptersInfo = quranData.chaptersInfo;
    let title = chaptersInfo[dataNumber - 1][quranData.articleTitleLang];
    isItArabic = appState.language.startsWith("ara");
    createArticle([title, dataNumber, chaptersInfo, quranData.quran]);
    UI.articleContainer.dataset.key = "chapters";
  } else {
    appState.bookNumber = dataNumber;
    const hadithData = await dataServer.hadithData();
    const translations = await dataServer.translationsData;
    const bookDetails = hadithData.bookDetails;

    createListInSidebar(
      hadithData.languagesOfBook,
      UI.languageSelector,
      "language",
      true,
    );

    let activeLan = UI.languageSelector.querySelector(
      `[data-language = ${appState.hadithLang[dataNumber - 1]}]`,
    );
    activateElement(UI.languageSelector.children, activeLan);

    generateQuoteFromJson(bookDetails, translations);
    isItArabic = bookDetails.isArabicLang;
    appState.siteLang = isItArabic ? "ar" : "en";
    createTextBook(bookDetails.sections, translations);
    UI.articleContainer.dataset.key = "Books";
  }

  UI.articleContainer.style.direction = isItArabic ? "rtl" : "ltr";
  hideLoading(body);
}

// ==================== Create Chapter Box ====================
async function createChapterBox(allChapters, translations) {
  let isItArabic = appState.siteLang.includes("ar");
  appState.siteLang = isItArabic ? "ar" : "en";
  let name = isItArabic ? "arabicname" : "name";

  UI.chaptersList.innerHTML = "";
  allChapters.forEach((chapter, ind) => {
    let elements = createElements(
      "chapterBox=div",
      "div",
      "span",
      "spanNum=span",
      "img",
      "h2",
    );

    if (appState.isItQuran) {
      let span = createElements("span").span;
      span.dataset.i18n = "UI.ayah";
      span.innerHTML = " اية";
      if (appState.siteLang == "en") {
        elements.span.style.left = "auto";
        elements.span.style.right = "13px";
      }
      elements.span.append(chapter.verses.length, span);
      elements.h2.dataset.arabicName = chapter.arabicname;
      elements.h2.dataset.latinName = chapter.name;
      elements.h2.innerHTML = chapter[name];
    } else {
      elements.h2.innerHTML =
        translations[appState.siteLang].hadith.booksName[ind];
      elements.h2.dataset.arabicName = translations["ar"].hadith.booksName[ind];
      elements.h2.dataset.latinName = translations["en"].hadith.booksName[ind];
      elements.h2.dataset.i18n = "hadith.booksName." + ind;
      elements.span.innerHTML = "";
    }

    elements.chapterBox.className = "chapter";
    elements.chapterBox.dataset.number = ind + 1;
    elements.spanNum.innerHTML = ind + 1;
    elements.img.src = "./assets/images/icons/aya-num.svg";
    elements.div.append(elements.spanNum, elements.img);
    elements.chapterBox.append(elements.div, elements.h2, elements.span);
    UI.chaptersList.append(elements.chapterBox);
  });
}

// ==================== Init App ====================
async function initApp(btn, data, dataInfo, dataLanguages, checkLang) {
  UI.articleContainer.innerHTML = "";
  UI.searchResultBox.innerHTML = "";
  UI.languageSelector.innerHTML =
    appState.siteLang == "en" ? "<p>Choose a book!</p>" : "<p>!اختر كتاب</p>";
  UI.quoteText.parentElement.dir = "rtl";

  const translations = await dataServer.translationsData;
  activateElement([UI.quranBtn, UI.hadithBtn], btn);
  createListInSidebar(
    dataLanguages,
    UI.languageSelector,
    "language",
    checkLang,
  );
  createChapterBox(dataInfo, translations);
  generateQuoteFromJson(data, translations);

  if (appState.isItQuran) {
    addBookOptions(bookOptions.quran, data.quranInfo);
    return;
  }
  addBookOptions(bookOptions.hadith, dataLanguages);
}

// ==================== Handle Selection ====================
export async function handleSelection(isQuran) {
  showLoading(body);
  UI.main.classList.remove("hidden");

  try {
    if (isQuran) {
      const [quranLanguages, quranData] = await Promise.all([
        QuranService.filteredLanguages(),
        dataServer.quranData(),
      ]);
      appState.isItQuran = true;
      localStorage.jsonFile = "Quran";
      initApp(
        UI.quranBtn,
        quranData,
        quranData.chaptersInfo,
        quranLanguages,
        true,
      );
    } else {
      const hadithData = await dataServer.hadithData();
      appState.isItQuran = false;
      localStorage.jsonFile = "Hadith";
      initApp(
        UI.hadithBtn,
        hadithData.bookDetails,
        hadithData.hadithBooks,
        hadithData,
        false,
      );
    }
  } finally {
    setTimeout(() => hideLoading(body), 1000);
  }
  renderBookmarksInMenu();
  checkBookmark();
}

// ==================== Font Size ====================
function handleFontSizeChange(operation) {
  const btns =
    operation === "increase"
      ? [UI.fontSizeIncrease, UI.fontSizeDecrease]
      : [UI.fontSizeDecrease, UI.fontSizeIncrease];

  if (operation === "increase" && appState.step >= appState.maxStep) {
    UI.fontSizeIncrease.style.opacity = ".5";
    return;
  }
  if (operation === "decrease" && appState.step <= appState.minStep) {
    UI.fontSizeDecrease.style.opacity = ".5";
    return;
  }

  const [btn1, btn2] = btns;
  if (operation === "increase") {
    appState.fontSize++;
    appState.step++;
  } else {
    appState.fontSize--;
    appState.step--;
  }

  btn1.style.opacity = "1";
  btn2.style.opacity = "1";
  UI.quoteText.style.fontSize = `${appState.fontSize}px`;
  UI.articleContainer.style.fontSize = `${appState.fontSize}px`;
  UI.articleContainer.style.maxWidth = `${700 + appState.step * 30}px`;
  UI.fontSizeIncrease.nextElementSibling.innerHTML = appState.step;
  localStorage.step = appState.step;
}

// ==================== Fonts ====================
async function setupFontOptions() {
  const fontsData = await getAllFonts();
  createListInSidebar(fontsData, UI.fontSelector, "font");
  let fontsList = document.querySelectorAll(".fonts-box li");

  fontsList.forEach((li) => {
    li.addEventListener("click", () => {
      UI.rightSidebar.classList.remove("active");
      activateElement(fontsList, li);
      addFontToStyle(li);
      localStorage.siteFont = li.dataset.font;
      elementsFont.forEach((ele) => (ele.style.fontFamily = li.dataset.font));
    });
  });

  getFromLocal(UI.fontSelector, localStorage.siteFont);
}

function addFontToStyle(li) {
  let fontName = li.dataset.font;
  if (styleElement.innerHTML.includes(li.dataset.fontName)) return;

  styleElement.append(`
    @font-face {
      font-family: '${fontName}';
      src: url('${li.dataset.woff2}') format('woff2'),
           url('${li.dataset.woff}') format('woff'),
           url('${li.dataset.ttf}') format('ttf');
    }`);
}

// ==================== Events ====================
function setupEventListeners() {
  window.addEventListener("offline", () => {
    showMessage("You are offline, check your connection");
  });

  window.addEventListener("online", () => {
    showMessage("Back online!");
  });
  UI.burgerMenuBtn.addEventListener("click", () =>
    UI.rightSidebar.classList.add("active"),
  );

  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    UI.downloadBtn.style.display = "block";
    deferredPrompt = e;
  });

  UI.downloadBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    let { outcome } = await deferredPrompt.userChoice;
    if (outcome !== "accepted") return;
    deferredPrompt = null;
    UI.downloadBtn.style.display = "none";
  });

  UI.searchBtn.addEventListener("click", () =>
    UI.leftSidebar.classList.add("active"),
  );

  UI.home.addEventListener("click", () => {
    scrollToTop();
    UI.articleContainer.innerHTML = "";
    UI.main.classList.remove("hidden");
  });

  UI.rightCloseBtn.addEventListener("click", () =>
    UI.rightSidebar.classList.remove("active"),
  );

  UI.leftCloseBtn.addEventListener("click", () =>
    UI.leftSidebar.classList.remove("active"),
  );

  UI.searchResultBox.addEventListener("click", () => {
    let selector = document.querySelector(".book-detail-selectors .active");
    let engName = selector?.dataset.engName;
    const hasSubMenu =
      engName == "verses" || engName == "sections" || engName == "Hadiths";
    if (hasSubMenu) return;
    UI.rightSidebar.classList.remove("active");
  });

  UI.siteLangAr.addEventListener("click", () => handleSiteLang(UI.siteLangAr));
  UI.siteLangEn.addEventListener("click", () => handleSiteLang(UI.siteLangEn));

  UI.fontSizeIncrease.addEventListener("click", () =>
    handleFontSizeChange("increase"),
  );
  UI.fontSizeDecrease.addEventListener("click", () =>
    handleFontSizeChange("decrease"),
  );

  UI.quranBtn.addEventListener("click", () => handleSelection(true));
  UI.hadithBtn.addEventListener("click", () => handleSelection(false));

  UI.chaptersList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-number]");
    if (!btn) return;
    UI.articleContainer.dataset.key = appState.isItQuran ? "chapters" : "Books";
    activateElement(UI.chaptersList.children, btn);
    showBook(btn);
  });

  UI.inputSearch.addEventListener("input", (ele) => handleSearch(ele, 0));
  UI.subInputSearch.addEventListener("input", (ele) => handleSearch(ele, 1));

  UI.leftSidebar.addEventListener("click", () => {
    let sb = UI.searchResultBox.querySelector(".sub-box");
    if (!sb) UI.subInputSearch.classList.add("hidden");
  });

  document.addEventListener("click", (e) => saveBookmark(e));

  UI.languageSelector.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-language]");
    if (!btn) return;
    activateElement(UI.languageSelector.children, btn);
    changeLanguage(btn);
  });

  window.addEventListener("scroll", () => {
    let percentage =
      (window.scrollY * 100) / document.documentElement.scrollHeight;
    UI.scrollTopBtn.style = `--scroll-percent:${percentage}%;`;
    UI.scrollTopBtn.style.opacity = window.scrollY >= 200 ? "1" : "0";
  });

  UI.scrollTopBtn.addEventListener("click", scrollToTop);
}

function showMessage(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = "toast";
  document.body.appendChild(el);

  setTimeout(() => el.remove(), 3000);
}
// ==================== Bootstrap ====================
setupEventListeners();
setupFontOptions();

if (localStorage.siteLanguage == "ar" || !localStorage.siteLanguage) {
  UI.siteLangAr.click();
} else {
  UI.siteLangEn.click();
}

if (localStorage.jsonFile == "Quran" || !localStorage.jsonFile) {
  handleSelection(true).then(() => {
    console.log("work");
    getFromLocal(UI.languageSelector, localStorage.bookLanguage);
  });
} else if (localStorage.jsonFile == "Hadith") {
  handleSelection(false);
}

function getFromLocal(parent, value) {
  if (value) {
    let activeEle = UI.fontSelector.querySelector(`[data-font = ${value}]`);

    if (!activeEle) return;
    activeEle.click();
    activateElement(parent.children, activeEle);
  }
}

// ==================== Bookmark ====================

function getBookmarkName(data) {
  return appState.siteLang === "ar"
    ? data.arabicName || data.number
    : data.latinName || data.number;
}

function saveBookmark(e) {
  let bookmark = e.target.closest(".bookmark");
  if (!bookmark) return;

  const storageKey = appState.isItQuran ? "quranBookmark" : "hadithBookmark";

  if (localStorage[storageKey]) {
    const confirmed = confirm(
      appState.siteLang === "ar"
        ? "سيتم استبدال الإشارة المرجعية القديمة. هل تريد المتابعة؟"
        : "This will replace your old bookmark. Do you want to continue?",
    );
    if (!confirmed) return;
  }

  // remove old active
  UI.articleContainer
    .querySelector(".bookmark.active")
    ?.classList.remove("active");
  bookmark.classList.add("active");

  // get book name in both languages
  const h2 = UI.chaptersList.querySelector(".chapter.active h2");

  const arabicName = h2?.dataset.arabicName;
  const latinName = h2?.dataset.latinName;

  localStorage[storageKey] = JSON.stringify({
    key: UI.articleContainer.dataset.key,
    number: UI.articleContainer.dataset.number,
    pageNumber: bookmark
      .closest(".page")
      ?.querySelector(".page-number")
      ?.innerHTML.trim(),
    lang: appState.language,
    bookNumber: appState.bookNumber,
    arabicName,
    latinName,
  });

  renderBookmarksInMenu();
}

function checkBookmark() {
  const quranBookmark = localStorage.quranBookmark;
  const hadithBookmark = localStorage.hadithBookmark;

  if (appState.isItQuran && quranBookmark) {
    showBookmarkBox(JSON.parse(quranBookmark), true);
  } else if (!appState.isItQuran && hadithBookmark) {
    showBookmarkBox(JSON.parse(hadithBookmark), false);
  }
}

async function showBookmarkBox(data, isQuran) {
  document.querySelector(".bookmark-box")?.remove();

  const translations = await dataServer.translationsData;
  const language = translations[appState.siteLang].UI;

  const typeEle = isQuran
    ? `<span data-i18n="UI.quranBtn">${language.quranBtn}</span>`
    : `<span data-i18n="UI.hadithBtn">${language.hadithBtn}</span>`;

  const nameKey = isQuran
    ? `quran.chapters.${data.number - 1}.name`
    : `hadith.booksName.${data.bookNumber - 1}`;

  const box = createElements("div").div;
  box.className = "bookmark-box";
  box.style.direction = appState.dir;
  box.innerHTML = `
   <p>
        ${typeEle} —
    <span
      data-arabic-name="${data.arabicName}"
      data-latin-name="${data.latinName}">
      ${getBookmarkName(data)}
    </span>
  </p>
    <div class="bookmark-actions">
      <button class="continue-btn" data-i18n="UI.continue">${language["continue"]}</button>
      <button class="dismiss-btn" data-i18n="UI.close">${language["close"]}</button>
    </div>
  `;

  document.body.append(box);

  box.querySelector(".continue-btn").addEventListener("click", async () => {
    box.remove();
    await restoreBookmark({ ...data, isQuran });
  });

  box
    .querySelector(".dismiss-btn")
    .addEventListener("click", () => box.remove());
}

async function restoreBookmark(data) {
  showLoading(body);

  if (data.isQuran) {
    appState.language = data.lang;
    appState.isItQuran = true;
    const quranData = await dataServer.quranData();
    const chaptersInfo = quranData.chaptersInfo;
    const title = chaptersInfo[data.number - 1][quranData.articleTitleLang];
    createArticle([title, +data.number, chaptersInfo, quranData.quran]);
  } else {
    appState.bookNumber = data.bookNumber;
    appState.isItQuran = false;
    const hadithData = await dataServer.hadithData();
    const translations = await dataServer.translationsData;
    createTextBook(hadithData.bookDetails.sections, translations);
  }

  UI.main.classList.add("hidden");
  hideLoading(body);

  // scroll to bookmarked page and activate bookmark icon
  setTimeout(() => {
    UI.articleContainer.querySelectorAll(".page-number").forEach((page) => {
      if (page.innerHTML.trim() === String(data.pageNumber).trim()) {
        page.closest(".page").scrollIntoView({ behavior: "smooth" });
        page
          .closest(".page")
          ?.querySelector(".bookmark")
          ?.classList.add("active");
      }
    });
  }, 300);
}

async function renderBookmarksInMenu() {
  document.querySelectorAll(".bookmark-menu-item").forEach((el) => el.remove());

  const translations = await dataServer.translationsData;
  const language = translations[appState.siteLang].UI;
  const bookmarkIcon = `<img src="./assets/images/icons/bookmark.svg" alt="bookmark"/>`;

  const quranBookmark = localStorage.quranBookmark;
  const hadithBookmark = localStorage.hadithBookmark;

  if (quranBookmark) {
    const data = JSON.parse(quranBookmark);
    const li = createElements("li").li;
    li.className = "bookmark-menu-item";
    li.innerHTML = `
        ${bookmarkIcon}
        <span
    data-arabic-name="${data.arabicName}"
    data-latin-name="${data.latinName}">
    ${getBookmarkName(data)}
  </span>
      `;

    li.addEventListener("click", async () => {
      appState.isItQuran = true;
      localStorage.jsonFile = "Quran";
      await handleSelection(true);
      await restoreBookmark({ ...data, isQuran: true });
    });

    UI.subMenu.append(li);
  }

  if (hadithBookmark) {
    const data = JSON.parse(hadithBookmark);
    const li = createElements("li").li;
    li.className = "bookmark-menu-item";

    li.innerHTML = `
            ${bookmarkIcon}
             <span
    data-arabic-name="${data.arabicName}"
    data-latin-name="${data.latinName}">
    ${getBookmarkName(data)}
  </span>
          `;
    li.addEventListener("click", async () => {
      appState.isItQuran = false;
      localStorage.jsonFile = "Hadith";
      await handleSelection(false);
      await restoreBookmark({ ...data, isQuran: false });
    });

    UI.subMenu.append(li);
  }
}
