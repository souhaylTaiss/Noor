// Script
/* ==================== Services / Data Fetching ==================== */
import { getAllFonts } from "../script/fonts.js";
import { QuranService } from "../script/quran.js";
import { HadithService } from "../script/hadith.js";
import { fetchUrl } from "./utils.js";

const translationUrl = "./assets/script/translations.json";

/* ========== Data Service / API Layer ========== */
const dataServer = {
  quranData: () => QuranService.getQuranByLang(appState.language),
  hadithData: () =>
    HadithService.hadithData(
      appState.bookNumber,
      appState.hadithLang[appState.bookNumber - 1],
    ),
  translationsData: fetchUrl(translationUrl),
};

/* ==================== DOM Elements ==================== */
const UI = {
  home: document.querySelector(".home"),
  main: document.querySelector("main"),
  burgerMenuBtn: document.querySelector(".menu"),
  searchBtn: document.querySelector(".search-btn"),
  rightCloseBtn: document.querySelector("aside.settings .close-btn"),
  leftCloseBtn: document.querySelector("aside.book-details .close-btn"),
  siteLangAr: document.querySelector(".website-language-box li:first-child"),
  siteLangEn: document.querySelector(".website-language-box li:last-child"),
  rightSidebar: document.querySelector("aside.settings"),
  leftSidebar: document.querySelector("aside.book-details"),
  searchResultBox: document.querySelector(".details"),
  bookOptionContainer: document.querySelector(".book-detail-selectors"),
  languageSelector: document.querySelector(".language-box"),
  fontSelector: document.querySelector(".fonts-box"),
  fontSizeIncrease: document.querySelector("aside .box .increase"),
  fontSizeDecrease: document.querySelector("aside .box .reduce"),
  quranBtn: document.querySelector("[value='quran']"),
  hadithBtn: document.querySelector("[value='hadith']"),
  inputSearch: document.querySelector(".search-field input"),
  subInputSearch: document.querySelector(".search-field input:last-child"),
  quoteText: document.querySelector(".quote-generator p"),
  quoteDetails: document.querySelector(".quote span"),
  shrinkingBar: document.querySelector(".shrinking-bar"),
  chaptersList: document.getElementById("chapters-container"),
  heroSection: document.querySelector(".hero-section"),
  generateBtn: document.querySelector(".generator .btn:first-child"),
  autoGenerateBtn: document.querySelector(".generator .btn:last-child"),
  pausePlayIcon: document.querySelector(".btn span"),
  articleContainer: document.querySelector("article .container"),
  loading: document.querySelector(".loading"),
};
/* ==================== App State & Config ==================== */
let body = document.querySelector("body");

showLoading(body);

let appState = {
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
  isGenerating: false,
  generateHandler: null,
  autoGenerateHandler: null,
  bookNumber: UI.articleContainer.dataset.number || 1,
};

const bookOptions = {
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

let elementsFont = document.querySelectorAll(".font-family");
let styleElement = document.createElement("style");

document.head.append(styleElement);

/* ==================== Helpers Functions ==================== */
if (!localStorage.hadithLang) {
  localStorage.hadithLang = JSON.stringify(appState.hadithLang);
}

function showLoading(target) {
  const loadingEle = createElements("div").div;
  loadingEle.className = "loading";
  loadingEle.innerHTML = `<div class="loading-ring"></div>`;
  target.style.position = "relative";

  if (target.tagName == "BODY") {
    loadingEle.style.backgroundColor = "white";
    loadingEle.style.height = "100vh";
    loadingEle.style.position = "fixed";
    loadingEle.style.zIndex = "19999";
  }

  target.insertAdjacentElement("afterbegin", loadingEle);
}

async function hideLoading(target) {
  const loadingEle = target.querySelector(".loading");
  loadingEle.remove();
}

const scrollToTop = () => window.scrollTo(0, 0);


async function translateArticleIfExists(data, articleTitleLang, translations) {
  const articleChildren = UI.articleContainer.hasChildNodes();
  if (!articleChildren) return;
  showLoading(UI.articleContainer);
  scrollToTop();

  let btnNumber = UI.articleContainer.dataset.number;
  const key = UI.articleContainer.dataset.key;

  if (appState.isItQuran && key == "chapters") {
    let chapterName = data.chaptersInfo[btnNumber - 1][articleTitleLang];
    createArticle([chapterName, +btnNumber, data.chaptersInfo, data.quran]);
    return;
  }

  if (key == "Books") {
    createTextBook(data.sections, translations);
    return;
  }

  let btn = UI.searchResultBox.querySelector("ul:first-child .active");
  let subBtn = UI.searchResultBox.querySelector(".sub-box .active");

  let lang = appState.hadithLang[btnNumber - 1];

  if (key == "sections") showHadithPart(lang, subBtn, btnNumber);

  if (key == "Hadiths") {
    showHadithsList(subBox, btn).then(() =>
      subBox.children[btnNumber - 1].click(),
    );
    return;
  }

  if (key == "juzs" || key == "pages") getQuranPart(btn, key);
  else if (Number.isInteger(+key)) {
    btnNumber = btn.dataset.number;
    getQuranPart(subBtn, btnNumber);
  }
}

function createElements(...elementsName) {
  let elements = {};
  elementsName.forEach((element) => {
    element = element.split("=");
    elements[element[0]] = document.createElement(element[element.length - 1]);
  });

  return elements;
}

function activateElement([...elements], li) {
  elements.forEach((li) => li.classList.remove("active"));
  li.classList.add("active");
  li.parentElement.scrollTo(0, li.offsetTop);
}

// Create list in sidebar
function createListInSidebar(obj, box, entry, checkBook = false) {
  box.innerHTML = "";

  for (let key in obj) {
    if (entry === "language" && checkBook) {
      addElements(key, entry, "author", "direction");
    } else if (entry === "font") {
      addElements(key, entry, "name", "woff2", "woff", "ttf");
    } else {
      box.innerHTML =
        appState.siteLang == "en"
          ? "<p>Choose a book!</p>"
          : "<p>!اختر كتاب</p>";
    }
  }

  function addElements(key, entry1, entry2, ...entry3) {
    let elements = createElements("li", "span");
    let details = obj[key][entry2] || obj[key]["name"];
    elements.li.dataset[entry1] = obj[key].name;
    elements.li.innerHTML = obj[key][entry1];
    elements.span.innerHTML = `   (${details})`;

    entry3.forEach((dataName) => {
      elements.li.dataset[dataName] =
        obj[key][dataName] || obj[key]["original"];
    });

    elements.li.append(elements.span);
    box.append(elements.li);
  }
}

/* ==================== Initialization ==================== */
let elementsReady;
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

  elementsReady = createChapterBox(dataInfo, translations);
  generateQuoteFromJson(data, translations);

  if (appState.isItQuran) {
    addBookOptions(bookOptions.quran, data.quranInfo);
    return;
  }
  addBookOptions(bookOptions.hadith, dataLanguages);
}

/* ==================== Event Listeners ==================== */
setupEventListeners();

function setupEventListeners() {
  UI.burgerMenuBtn.addEventListener("click", () =>
    UI.rightSidebar.classList.add("active"),
  );

  UI.searchBtn.addEventListener("click", () =>
    UI.leftSidebar.classList.add("active"),
  );

  UI.home.addEventListener("click", () => {
    scrollToTop()
    UI.articleContainer.innerHTML = "";
    UI.main.classList.remove("hidden");
  })

  UI.rightCloseBtn.addEventListener("click", () =>
    UI.rightSidebar.classList.remove("active"),
  );

  UI.leftCloseBtn.addEventListener("click", () =>
    UI.leftSidebar.classList.remove("active"),
  );

  UI.siteLangAr.addEventListener("click", () => handleSiteLang(UI.siteLangAr));
  UI.siteLangEn.addEventListener("click", () => handleSiteLang(UI.siteLangEn));

  UI.fontSizeIncrease.addEventListener("click", () =>
    handleFontSizeChange("increase"),
  );
  UI.fontSizeDecrease.addEventListener("click", () =>
    handleFontSizeChange("decrease"),
  );

  UI.quranBtn.addEventListener("click", () => handleQuranSelection());
  UI.hadithBtn.addEventListener("click", () => handleHadithSelection());

  UI.chaptersList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-number]");
    if (!btn) return;
    UI.articleContainer.dataset.key = appState.isItQuran ? "chapters" : "Books";
    showBook(btn);
  });

  UI.inputSearch.addEventListener("input", (ele) => handleSearch(ele, 0));
  UI.subInputSearch.addEventListener("input", (ele) => handleSearch(ele, 1));

  UI.leftSidebar.addEventListener("click", () => {
    let subBox = UI.searchResultBox.querySelector(".sub-box");
    if (!subBox) UI.subInputSearch.classList.add("hidden");
  });

  UI.languageSelector.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-language]");
    if (!btn) return;

    activateElement(UI.languageSelector.children, btn);
    changeLanguage(btn);
  });
}

/* ==================== Event Handlers / Interactions ==================== */
// Change language of website

if (localStorage.siteLanguage == "ar") {
  UI.siteLangAr.click();
} else {
  UI.siteLangEn.click();
}

async function handleSiteLang(btn) {
  showLoading(body);

  activateElement([UI.siteLangAr, UI.siteLangEn], btn);
  appState.siteLang = btn.dataset.lang;
  appState.dir = btn.dataset.dir;
  setLanguage();

  await new Promise((resolve) => setTimeout(resolve, 400));
  hideLoading(body);
}

async function setLanguage() {
  let translations = await dataServer.translationsData;
  let chaptersInfo, elements;

  if (appState.isItQuran) {
    chaptersInfo = (await dataServer.quranData()).chaptersInfo;
    changeChapterBoxLanguage(chaptersInfo);
  }

  elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((ele) => {
    const path = ele.dataset.i18n.split(".");
    let text = translations[appState.siteLang];
    path.forEach((key) => (text = text[key]));
    ele.innerHTML = text;
    ele.dir = appState.dir;
  });

  const box = UI.searchResultBox.firstElementChild;
  const subBox = UI.searchResultBox.querySelector(".sub-box");

  changeContentLang(UI.bookOptionContainer);
  changeContentLang(subBox);
  changeContentLang(box);

  localStorage.siteLanguage = appState.siteLang;
  UI.inputSearch.placeholder = translations[appState.siteLang].UI.inputSearch;
  UI.subInputSearch.placeholder =
    translations[appState.siteLang].UI.inputSearch;
  UI.chaptersList.dir = appState.dir;

  const searchDetailEle = UI.leftSidebar.lastElementChild;
  searchDetailEle.style.direction = appState.dir;

  UI.rightSidebar.firstElementChild.classList.remove("direction");
  UI.leftSidebar.firstElementChild.classList.remove("direction");
  if (appState.siteLang == "en") {
    UI.rightSidebar.firstElementChild.classList.add("direction");
    UI.leftSidebar.firstElementChild.classList.add("direction");
  }
}


function changeContentLang(container) {
  if (!container) return;
  const elements = Array.from(container?.children);

  elements.forEach((li) => {
    let content = li.dataset.engName || li.dataset.latinName;
    if (appState.siteLang == "ar") content = li.dataset.arabicName;

    li.innerHTML = content;
});
}

async function changeChapterBoxLanguage(chaptersInfo) {
  let name = "name",
    leftValue = "auto",
    rightValue = "13px",
    ayah = "Ayah";

    if (appState.siteLang == "ar") {
      name = "arabicname";
      [leftValue, rightValue] = [rightValue, leftValue];
      ayah = "اية";
    }

    const chaptersBox = UI.chaptersList.querySelectorAll(".chapter");

    chaptersBox.forEach((ele, ind) => {
    ele.children[1].innerHTML = chaptersInfo[ind][name];
    ele.children[2].style.left = leftValue;
    ele.children[2].style.right = rightValue;
    ele.children[2].innerHTML = `${chaptersInfo[ind].verses.length} ${ayah}`;
  });
}

/* ==================== State Handlers ==================== */
if (localStorage.jsonFile == "Quran" || !localStorage.jsonFile) {
  handleQuranSelection().then(() => {
    if (localStorage.bookLanguage) {
      let activeLan = UI.languageSelector.querySelector(
        `[data-language = ${localStorage.bookLanguage}]`,
      );
      activateElement(UI.languageSelector.children, activeLan);
    }
  });
} else if (localStorage.jsonFile == "Hadith") handleHadithSelection();

async function handleQuranSelection() {
  const quranLanguages = await QuranService.filteredLanguages();
  const quranData = await dataServer.quranData();
  const chaptersInfo = quranData.chaptersInfo;

  appState.isItQuran = true;
  localStorage.jsonFile = "Quran";
  initApp(UI.quranBtn, quranData, chaptersInfo, quranLanguages, true);
}

async function handleHadithSelection() {
  const hadithData = await dataServer.hadithData();
  const books = hadithData.hadithBooks;
  const bookDetails = hadithData.bookDetails;

  appState.isItQuran = false;
  localStorage.jsonFile = "Hadith";
  initApp(UI.hadithBtn, bookDetails, books, hadithData, false);
}

// Change text size
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

  changeTextSize(btns, operation);
  localStorage.step = appState.step;
}

// Change font size
const isMobile = window.innerWidth < 768;
const mobileSize = Math.ceil(appState.fontSize * 0.6);

appState.fontSize = isMobile ? mobileSize : appState.fontSize;

UI.fontSizeIncrease.nextElementSibling.innerHTML = appState.step;
UI.quoteText.style.fontSize = `${appState.fontSize}px`;
UI.articleContainer.style.fontSize = `${appState.fontSize}px`;
UI.articleContainer.style.maxWidth = `${700 + appState.step * 30}px`;

function changeTextSize(btns, operation) {
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
}

// Set fonts
async function setupFontOptions() {
  const fontsData = await getAllFonts();
  createListInSidebar(fontsData, UI.fontSelector, "font");
  let fontsList = document.querySelectorAll(".fonts-box li");

  fontsList.forEach((li) => {
    li.addEventListener("click", () => {
      activateElement(fontsList, li);
      addFontToStyle(li);
      localStorage.siteFont = li.dataset.font;
      elementsFont.forEach((ele) => {
        ele.style.fontFamily = `${li.dataset.font}`;
      });
    });
  });
}
setupFontOptions();

function addFontToStyle(li) {
  let fontName = li.dataset.font;
  let isIncludeFont = styleElement.innerHTML.includes(li.dataset.fontName);
  let fontFace = `
          @font-face {
            font-family: '${fontName}';
            src: url('${li.dataset.woff2}') format('woff2'),
                url('${li.dataset.woff}') format('woff'),
                url('${li.dataset.ttf}') format('ttf');
          }`;

  if (!isIncludeFont) styleElement.append(fontFace);
}

/* ==================== Search Sidebar ==================== */
function addBookOptions(data, dataInfo) {
  UI.bookOptionContainer.innerHTML = "";

  let contentLang;
  if (appState.siteLang == "ar") contentLang = "content";
  else contentLang = "data";

  for (let ind in data) {
    let li = createElements("li").li;
    li.innerHTML = data[ind][contentLang];
    li.dataset.engName = data[ind].data;
    li.dataset.arabicName = data[ind].content;
    UI.bookOptionContainer.append(li);
  }

  let all = document.querySelectorAll(".book-detail-selectors li");
  all.forEach((li) => {
    li.addEventListener("click", () => {
      UI.searchResultBox.innerHTML = "";
      activateElement(all, li);
      getSpecificParts(li, dataInfo);
    });
  });
}

async function getSpecificParts(li, dataInfo) {
  let key = li.dataset.engName;
  const translations = await dataServer.translationsData;
  let ul = createElements("ul").ul;

  let keys = {
    dataInfo: dataInfo[key],
    key1: "name",
    key2: "arabicname",
    keyFilter: key,
    translations: translations,
    ul: ul,
  };

  if (key === "chapters" || key === "verses") {
    if (key === "verses") key = "chapters";
    keys.dataInfo = dataInfo[key];
    keys.keyFilter = key;
    showMatchDAta(keys);
  } else if (key === "juzs") {
    keys.dataInfo = dataInfo[key].references;
    keys.key1 = "juz";
    keys.key2 = "جزء";
    showMatchDAta(keys);
  } else if (key === "pages") {
    keys.dataInfo = dataInfo[key].references;
    keys.key1 = "page";
    keys.key2 = "صفحة";

    showMatchDAta(keys);
  } else {
    let hadithBooksName = Object.values(
      translations[appState.siteLang].hadith.booksName,
    );

    keys.dataInfo = hadithBooksName;
    keys.key1 = "booksName";
    keys.key2 = "كتاب";

    showMatchDAta(keys);
  }

  ul.style.flexGrow = 1;
  UI.searchResultBox.append(ul);
}

let subBox = createElements("ul").ul;
subBox.classList.add("sub-box");

function showMatchDAta({
  dataInfo: chaptersInfo,
  key1,
  key2,
  keyFilter,
  translations,
  ul,
}) {
  for (let i = 0; i < chaptersInfo.length; i++) {
    let ele = createElements("li").li;
    let latinName = `${key1} ${i + 1}`;
    let arabicName = `${key2} ${i + 1}`;

    let wordLang = appState.siteLang == "en" ? key1 : key2;
    let keyValue = key1;

    if (keyFilter == "chapters" || keyFilter == "verses") {
      wordLang = "";
      latinName = chaptersInfo[i][key1];
      arabicName = chaptersInfo[i][key2];
      if (appState.siteLang === "ar") keyValue = key2;
    } else if (
      keyFilter == "Books" ||
      keyFilter == "sections" ||
      keyFilter == "Hadiths"
    ) {
      wordLang = "";
      latinName = translations.en.hadith.booksName[i];
      arabicName = translations.ar.hadith.booksName[i];
    }

    ele.dataset.lang = appState.siteLang;
    ele.dataset.latinName = latinName;
    ele.dataset.arabicName = arabicName;
    ele.dataset.dir = appState.dir;
    ele.dataset.number = i + 1;

    ele.innerHTML = `${wordLang} ${chaptersInfo[i][keyValue] || chaptersInfo[i]}`;

    ele.addEventListener("click", () => renderContent(ele, ul, chaptersInfo));
    ul.append(ele);
  }
}

async function renderContent(btn, ul, chaptersInfo) {
  let selector = document.querySelector(".book-detail-selectors .active");
  let engName = selector.dataset.engName;
  let btnNumber = btn.dataset.number;
  activateElement(ul.children, btn);

  if (engName == "chapters") UI.chaptersList.children[btnNumber - 1].click();
  else if (engName == "juzs" || engName == "pages") getQuranPart(btn, engName);
  else if (engName == "verses") showVersesList(btnNumber, subBox, chaptersInfo);

  if (!appState.isItQuran) {
    let lang = appState.hadithLang[btnNumber - 1];

    let hadithData = await HadithService.hadithData(btnNumber, lang);
    let bookLanguages = hadithData.languagesOfBook;
    createListInSidebar(bookLanguages, UI.languageSelector, "language", true);
  }

  appState.bookNumber = btnNumber;
  if (engName == "Books") showBook(btn);
  else if (engName == "sections") showSectionsList(subBox, btnNumber);
  else if (engName == "Hadiths") showHadithsList(subBox, btn);
}

async function showSectionsList(subBox, btnNumber) {
  UI.subInputSearch.innerHTML = "";
  subBox.innerHTML = "";
  let lang = appState.hadithLang[btnNumber - 1];
  const translations = await dataServer.translationsData;
  let sections =
    translations[appState.siteLang].hadith.bookSections[btnNumber - 1];

  sections.forEach((section, ind) => {
    let latinSection =
      translations["en"].hadith.bookSections[btnNumber - 1][ind];
    let arabicSection =
      translations["ar"].hadith.bookSections[btnNumber - 1][ind];
    let li = createElements("li").li;

    li.dataset.number = ind + 1;
    li.dataset.latinName = latinSection;
    li.dataset.arabicName = arabicSection;
    li.innerHTML = `${section}`;

    li.addEventListener("click", async () => {
      activateElement(subBox.children, li);
      showHadithPart(lang, li, btnNumber);
    });

    subBox.append(li);
  });

  UI.subInputSearch.classList.remove("hidden");
  UI.searchResultBox.append(subBox);
}

async function showHadithsList(subBox) {
  subBox.innerHTML = "";
  showLoading(subBox);
  let bookNumber = appState.bookNumber;
  let lang = appState.hadithLang[bookNumber - 1];
  const hadithData = await HadithService.hadithData(bookNumber, lang);

  const hadiths = hadithData.bookDetails.hadiths;

  for (let i = 0; i < hadiths.length; i++) {
    let li = createElements("li").li;

    li.dataset.number = i + 1;
    li.dataset.latinName = `Hadith ${i + 1}`;
    li.dataset.arabicName = `حديث ${i + 1}`;
    li.innerHTML = `${appState.siteLang == "ar" ? "حديث" : "Hadith"} ${i + 1}`;

    li.addEventListener("click", () => {
      showHadithContent(li, lang, hadiths);
    });

    subBox.append(li);
  }
  UI.subInputSearch.classList.remove("hidden");
  UI.searchResultBox.append(subBox);
  hideLoading(subBox);
}

function showHadithContent(li, lang, hadiths) {
  let hadithNum = li.dataset.number;
  let elements = createElements("page=div", "content=p", "detail=p");

  UI.articleContainer.innerHTML = "";
  UI.articleContainer.dataset.number = hadithNum;
  UI.articleContainer.dataset.key = "Hadiths";

  activateElement(subBox.children, li);

  elements.page.className = "page";
  elements.content.innerHTML = hadiths[hadithNum - 1].text;

  if (appState.siteLang == "ar" || lang.startsWith("ar")) {
    elements.detail.innerHTML = li.dataset.arabicName;
  } else elements.detail.innerHTML = li.dataset.latinName;

  elements.content.append(elements.detail);
  elements.page.append(elements.content);
  UI.articleContainer.append(elements.page);
}

function showVersesList(btnNumber, subBox, dataInfo) {
  const versesInfo = dataInfo[btnNumber - 1].verses;
  subBox.innerHTML = "";

  for (let i = 0; i < versesInfo.length; i++) {
    let li = createElements("li").li;
    li.dataset.number = i + 1;
    li.dataset.latinName = `Verse ${i + 1}`;
    li.dataset.arabicName = `آية ${i + 1}`;
    li.innerHTML = `${appState.siteLang == "ar" ? "آية" : "Verse"} ${i + 1}`;

    li.addEventListener("click", () => {
      activateElement(subBox.children, li);
      getQuranPart(li, btnNumber);
    });

    subBox.append(li);
  }

  UI.subInputSearch.classList.remove("hidden");
  UI.searchResultBox.append(subBox);
}

let noResultMsg = createElements("p").p;
noResultMsg.className = "no-result-msg";
noResultMsg.dataset.latinName = "No result!";
noResultMsg.dataset.arabicName = "لا نتائج!";
noResultMsg.innerHTML = appState.siteLang == "ar" ? "لا نتائج!" : "No result!";

function handleSearch(ele, boxNum) {
  const box = UI.searchResultBox?.children[boxNum];
  const searchText = ele.target.value;
  const options = [...(box?.children || [])];

  box?.append(noResultMsg);

  options.forEach((opt) => {
    opt.style.display = "none";
    let span = opt.querySelector("span");
    span?.replaceWith(span.innerHTML);
  });

  let matchesList = options.filter((opt) => {
    const regPatter = /[\u064B-\u0652\u0653\u0670\u06D6-\u06ED]/g;
    opt.innerHTML = opt.innerHTML.replace(regPatter, "");
    return opt.innerHTML.match(searchText);
  });

  matchesList.forEach((li) => {
    li.style.display = "block";
    li.innerHTML = li.innerHTML.replace(
      searchText,
      `<span>${searchText}</span>`,
    );
  });

  !matchesList.length
    ? (noResultMsg.style.display = "block")
    : (noResultMsg.style.display = "none");
}

async function showBook(btn) {
  let dataNumber = +btn.dataset.number;
  let isItArabic = true;

  showLoading(body);
  scrollToTop();
  UI.main.classList.add("hidden")

  if (appState.isItQuran) {
    const quranData = await dataServer.quranData();
    const quran = quranData.quran;
    const chaptersInfo = quranData.chaptersInfo;

    let title = chaptersInfo[dataNumber - 1][quranData.articleTitleLang];
    isItArabic = appState.language.startsWith("ara");
    createArticle([title, dataNumber, chaptersInfo, quran]);
    UI.articleContainer.dataset.key = "chapters";
  } else {
    appState.bookNumber = dataNumber;
    const hadithData = await dataServer.hadithData();
    const translations = await dataServer.translationsData;
    const bookDetails = hadithData.bookDetails;

    let sections = bookDetails.sections;
    let languages = hadithData.languagesOfBook;

    createListInSidebar(languages, UI.languageSelector, "language", true);

    let selector = `[data-language = ${appState.hadithLang[dataNumber - 1]}]`;
    let activeLan = UI.languageSelector.querySelector(selector);
    activateElement(UI.languageSelector.children, activeLan);

    generateQuoteFromJson(bookDetails, translations);

    isItArabic = bookDetails.isArabicLang;
    appState.siteLang = bookDetails.isArabicLang ? "ar" : "en";
    createTextBook(sections, translations);
    UI.articleContainer.dataset.key = "Books";
  }
  UI.articleContainer.style.direction = isItArabic ? "rtl" : "ltr" ;
  hideLoading(body);
}

/* ==================== Create Article ==================== */

function createTextBook(sections, translations) {
  let siteLang = appState.siteLang;
  let title = createElements("h2").h2;
  UI.articleContainer.innerHTML = "";
  UI.articleContainer.dataset.number = appState.bookNumber;
  title.innerHTML =
    translations[siteLang].hadith.booksName[appState.bookNumber - 1];

  for (let ind in sections) {
    let subTitle = createElements("h3").h3;

    subTitle.innerHTML =
      translations[siteLang].hadith.bookSections[appState.bookNumber - 1][
        ind - 1
      ] || "";

    let isItNewSection = true;
    for (let i in sections[ind].content) {
      let elements = createElements(
        "page=div",
        "titleBox=div",
        "subTitle=h3",
        "textBox=div",
        "pageNumber=span",
      );

      if (i === "1") {
        elements.titleBox.append(title);
        elements.page.append(elements.titleBox);
      }

      if (isItNewSection) {
        elements.titleBox.append(subTitle);
        elements.page.append(elements.titleBox);
        isItNewSection = false;
      }

      let hadiths = sections[ind].content[i];

      hadiths.forEach((hadith) => {
        let { text, reference } = createElements("text=p", "reference=p");
        text.innerHTML = hadith.text;
        let bookLang = appState.hadithLang[appState.bookNumber - 1];
        let word = "Hadith";
        if (bookLang.startsWith("ar")) {
          word = "حديث";
        }
        reference.innerHTML = `${word} ${hadith.reference.hadith}`;
        text.append(reference);
        text.style.marginBottom = "20px";
        elements.textBox.append(text);
      });

      elements.page.className = "page";
      elements.pageNumber.classList.add("page-number");
      elements.pageNumber.innerHTML = i;
      elements.page.append(elements.textBox, elements.pageNumber);
      UI.articleContainer.append(elements.page);
    }
    if (ind == 3) break;
  }
}

function createArticle(chapterData) {
  UI.articleContainer.innerHTML = "";

  let articleData = QuranService.formatChapterPages(chapterData);
  let { pages, chapterName, chapterNum, basmala } = articleData;

  let firstPage = Object.keys(pages)[0];
  for (let ind in pages) {
    let elements = createElements(
      "page=div",
      "titleBox=div",
      "title=h2",
      "p",
      "pageText=p",
      "pageNumber=span",
    );

    if (firstPage === ind) {
      UI.articleContainer.dataset.number = chapterNum;
      UI.articleContainer.dataset.key = "chapters";
      elements.titleBox.className = "title-box";
      elements.title.innerHTML = chapterName;
      elements.p.innerHTML = basmala;
      elements.titleBox.append(elements.title, elements.p);
      elements.page.append(elements.titleBox);
    }

    elements.page.className = "page";
    elements.page.append(elements.pageText);

    addTextToPage(pages[ind], elements);

    elements.pageNumber.classList.add("page-number");
    elements.pageNumber.innerHTML = ind;
    elements.page.append(elements.pageNumber);
    UI.articleContainer.append(elements.page);
  }
}

async function getQuranPart(btn, key) {
  let lang = appState.language.startsWith("ar") ? "arabicName" : "latinName";

  showLoading(body);
  scrollToTop();
  UI.main.classList.add("hidden")

  let btnNumber = btn.dataset.number;
  let partName = btn.dataset[lang];

  UI.articleContainer.innerHTML = "";
  let pages;

  let quranData = await dataServer.quranData();
  let chaptersInfo = quranData.chaptersInfo;

  if (key == "juzs") {
    pages = await QuranService.showJuzOfChapter(
      appState.language,
      key,
      btnNumber,
    );
  } else if (key == "pages") {
    pages = await QuranService.getSpecificPart(
      appState.language,
      key,
      btnNumber,
    );
  } else {
    let verse = await QuranService.getSpecificPart(
      appState.language,
      key,
      btnNumber,
    );

    pages = {};
    pages[partName] = [verse];
  }

  let pagesArr = Object.entries(pages);
  let firstPage = pagesArr[0][0];

  let preChapter = pagesArr[0][1][0].chapter;

  pagesArr.forEach((page) => {
    let ind = page[0];
    let isFirstPage = firstPage === ind;
    let elements = createElements(
      "page=div",
      "titleBox=div",
      "title=h2",
      "subTitle=h3",
      "pageText=p",
      "pageNumber=span",
    );

    if (isFirstPage) {
      UI.articleContainer.dataset.number = btnNumber;
      UI.articleContainer.dataset.key = key;
      elements.titleBox.className = "title-box";
      elements.title.innerHTML = btn.dataset[lang];
      elements.titleBox.append(elements.title);
      if (!(key == "pages" || btn.dataset.latinName.startsWith("Verse"))) {
        elements.page.append(elements.titleBox);
      }
    }

    if (page[1][0].chapter !== preChapter || isFirstPage) {
      preChapter = page[1][0].chapter;

      let titleLang = "name";
      if (appState.language.startsWith("ar")) titleLang = "arabicname";

      elements.subTitle.innerHTML = chaptersInfo[preChapter - 1][titleLang];
      elements.page.append(elements.subTitle);
    }

    elements.page.className = "page";
    elements.page.append(elements.pageText);

    preChapter = addTextToPage(pages[ind], elements, chaptersInfo, preChapter);

    elements.pageNumber.classList.add("page-number");

    elements.pageNumber.innerHTML = isNaN(+ind) ? btnNumber : ind;
    elements.page.append(elements.pageNumber);
    UI.articleContainer.append(elements.page);
  });

  hideLoading(body);
}

async function showHadithPart(lang, li, bookNumber) {
  UI.articleContainer.innerHTML = "";
  let sectionNumber = li.dataset.number;

  showLoading(body);
  scrollToTop();
  UI.main.classList.add("hidden")

  UI.articleContainer.dataset.number = bookNumber;
  UI.articleContainer.dataset.key = "sections";

  let bookDetails = await HadithService.getSpecificPart(
    lang,
    "sections",
    sectionNumber,
  );

  let hadiths = bookDetails.hadiths;

  let counter = 1;
  let pages = {};
  let arr = [];

  for (let i = 0; i < hadiths.length; i++) {
    if (arr.length === 3) {
      pages[counter] = arr;
      arr = [];
      counter++;
    }

    arr.push(hadiths[i]);
  }

  let title = createElements("h2").h2;

  if (appState.siteLang == "ar" || lang.startsWith("ara")) {
    title.innerHTML = li.dataset.arabicName;
  } else title.innerHTML = li.dataset.latinName;

  for (let i in pages) {
    let elements = createElements(
      "page=div",
      "titleBox=div",
      "subTitle=h3",
      "textBox=div",
      "pageNumber=span",
    );

    if (i === "1") {
      elements.titleBox.append(title);
      elements.page.append(elements.titleBox);
    }

    let hadiths = pages[i];

    hadiths.forEach((hadith) => {
      let { text, reference } = createElements("text=p", "reference=p");
      text.innerHTML = hadith.text;
      let word = "Hadith";
      if (lang.startsWith("ar")) {
        word = "حديث";
      }
      reference.innerHTML = `${word} ${hadith.reference.hadith}`;
      text.append(reference);
      elements.textBox.append(text);
    });

    elements.page.className = "page";
    elements.pageNumber.classList.add("page-number");
    elements.pageNumber.innerHTML = i;
    elements.page.append(elements.textBox, elements.pageNumber);
    UI.articleContainer.append(elements.page);
  }
  hideLoading(body);
}

function addTextToPage(pageData, elements, chaptersInfo, preChapter) {
  pageData.forEach((ayahData) => {
    let title = "";

    if (ayahData.chapter !== preChapter && preChapter !== undefined) {
      title = createElements("title=h2").title;
      title.style.textAlign = "center";
      title.style.margin = "20px auto -5px";
      title.innerHTML = chaptersInfo[preChapter].arabicname;
      preChapter = ayahData.chapter;
    }

    let versesNumber = document.createElement("span");
    versesNumber.classList.add("verse-number");
    versesNumber.innerHTML = ayahData.verse;
    elements.pageText.append(title, ayahData.text, versesNumber);
  });

  return preChapter;
}

// create book box
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
      elements.h2.innerHTML = chapter[name];
    } else {
      elements.h2.innerHTML =
        translations[appState.siteLang].hadith.booksName[ind];
      elements.h2.dataset.i18n = "hadith.booksName." + ind;
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

async function changeLanguage(btn) {
  let translations = await dataServer.translationsData;
  let dataDetails, articleTitleLang;

  localStorage.languageDirection = appState.direction;

  let isItArabic;
  if (appState.isItQuran) {
    appState.language = btn.dataset.language;
    localStorage.bookLanguage = appState.language;
    appState.direction = btn.dataset.direction;

    isItArabic = appState.language.startsWith("ara");
    appState.siteLang = isItArabic ? "ar" : "en";
    articleTitleLang = isItArabic ? "arabicname" : "name";

    dataDetails = await dataServer.quranData();
  } else {
    appState.bookNumber = UI.articleContainer.dataset.number;
    appState.hadithLang[appState.bookNumber - 1] = btn.dataset.language;
    const hadithLang = JSON.parse(localStorage.hadithLang || "{}");
    hadithLang[appState.bookNumber - 1] = btn.dataset.language;
    localStorage.hadithLang = JSON.stringify(hadithLang);

    let hadithData = await dataServer.hadithData(
      appState.bookNumber,
      appState.hadithLang[appState.bookNumber - 1],
    );

    dataDetails = hadithData.bookDetails;
    isItArabic = dataDetails.isArabicLang;
    appState.siteLang = dataDetails.isArabicLang ? "ar" : "en";
  }

  let dir = isItArabic ? "rtl" : "ltr";
  UI.articleContainer.style.direction = dir;
  UI.quoteText.parentElement.style.direction = dir;

  generateQuoteFromJson(dataDetails, translations);
  translateArticleIfExists(dataDetails, articleTitleLang, translations, btn);
}

/* ==================== Generate Quote ==================== */
const counter = UI.shrinkingBar.querySelector("div");

async function generateQuoteFromJson(data, translations) {
  await generate(data, translations);

  if (appState.generateHandler) {
    UI.generateBtn.removeEventListener("click", appState.generateHandler);
  }

  if (appState.autoGenerateHandler) {
    UI.autoGenerateBtn.removeEventListener(
      "click",
      appState.autoGenerateHandler,
    );
  }

  appState.generateHandler = () => {
    stopAutoGenerating();
    generate(data, translations);
  };

  appState.autoGenerateHandler = () => autoGenerateQuote(data, translations);

  UI.generateBtn.addEventListener("click", appState.generateHandler);
  UI.autoGenerateBtn.addEventListener("click", appState.autoGenerateHandler);
}

async function autoGenerateQuote(data, translations) {
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

  // reading time is fresh after generate
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

function stopAutoGenerating() {
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
    createQuranQuote(randomText);
  } else {
    randomText = HadithService.getRandomHadith(data.hadiths);
    createHadithQuote(randomText, translations);
  }

  hideLoading(UI.quoteText.parentElement);
  UI.quoteText.style.opacity = 1;
  UI.quoteDetails.style.opacity = 1;

  return randomText;
}

function createQuranQuote(randomAyah) {
  UI.quoteText.innerHTML = randomAyah.verseText;
  UI.quoteDetails.innerHTML = `${randomAyah.ayah} ${randomAyah.verseNumber} ${randomAyah.surah} ${randomAyah.surahName}`;
}

function createHadithQuote(randomHadith, translations) {
  UI.quoteText.innerHTML = randomHadith.hadith;
  let isArabic = appState.hadithLang[appState.bookNumber - 1].startsWith("ar");
  const bookName =
    translations[isArabic? "ar" : "en"].hadith.booksName[appState.bookNumber - 1];

  const hadith = isArabic? "حديث" : "Hadith";
  UI.quoteDetails.innerHTML = `${hadith} ${randomHadith.hadithNumber}, ${bookName}`;
}

function getReadingTime(text) {
  const wordsPerMinute = appState.siteLang === "ar" ? 200 : 250;
  const words = text.trim().split(/\s+/).length;
  const seconds = Math.ceil((words / wordsPerMinute) * 60);
  return Math.max(seconds, 3);
}

setTimeout(() => hideLoading(body), 3000);


