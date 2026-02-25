// ==================== Language / i18n ====================
import { UI, activateElement } from "./elements.js";
import { appState, isArabic } from "./state.js";
import { dataServer } from "./data.js";
import { showLoading, hideLoading } from "./loading.js";
import { createArticle, createTextBook } from "./article.js";
import { generateQuoteFromJson } from "./quote.js";

const body = document.body;

export async function handleSiteLang(btn) {
  showLoading(body);
  activateElement([UI.siteLangAr, UI.siteLangEn], btn);
  UI.rightSidebar.classList.remove("active");
  appState.siteLang = btn.dataset.lang;
  appState.dir = btn.dataset.dir;
  setLanguage();

  await new Promise((resolve) => setTimeout(resolve, 400));
  hideLoading(body);
}

export async function setLanguage() {
  let translations = await dataServer.translationsData;

  if (appState.isItQuran) {
    const chaptersInfo = (await dataServer.quranData()).chaptersInfo;
    changeChapterBoxLanguage(chaptersInfo);
  }

  document.querySelectorAll("[data-i18n]").forEach((ele) => {
    const path = ele.dataset.i18n.split(".");
    let text = translations[appState.siteLang];
    path.forEach((key) => (text = text[key]));
    ele.innerHTML = text;
    ele.dir = appState.dir;
  });

  changeContentLang();

  localStorage.siteLanguage = appState.siteLang;
  UI.inputSearch.placeholder = translations[appState.siteLang].UI.inputSearch;
  UI.subInputSearch.placeholder = translations[appState.siteLang].UI.inputSearch;
  UI.chaptersList.dir = appState.dir;
  UI.leftSidebar.lastElementChild.style.direction = appState.dir;

UI.logo.src = isArabic()
? UI.logo.src.replace("logo", "arabic-logo")
  : UI.logo.src.replace("arabic-logo", "logo")

  let bookmarkBox = document.querySelector(".bookmark-box");
  reverseDir(bookmarkBox);
  reverseDir(UI.navbar);
  reverseDir(UI.menuContainer);
  reverseDir(UI.rightSidebar.firstElementChild);
  reverseDir(UI.leftSidebar.firstElementChild);
}

export function reverseDir(ele) {
  UI.subMenu.style.direction = "rtl";
  ele?.classList.add("direction");

  if (appState.siteLang == "en") {
    UI.subMenu.style.direction = "ltr";
    ele?.classList.remove("direction");
  }
}

export function changeContentLang() {
  document.querySelectorAll("[data-arabic-name]").forEach((ele) => {
    ele.innerHTML = appState.siteLang === "ar"
      ? ele.dataset.arabicName
      : ele.dataset.latinName || ele.dataset.engName;
  });
}

export async function changeChapterBoxLanguage(chaptersInfo) {
  let name = "name", leftValue = "auto", rightValue = "13px", ayah = "Ayah";

  if (appState.siteLang == "ar") {
    name = "arabicname";
    [leftValue, rightValue] = [rightValue, leftValue];
    ayah = "اية";
  }

  UI.chaptersList.querySelectorAll(".chapter > span").forEach((ele, ind) => {
    ele.parentElement.children[1].innerHTML = chaptersInfo[ind][name];
    ele.style.left = leftValue;
    ele.style.right = rightValue;
    ele.innerHTML = `${chaptersInfo[ind].verses.length} ${ayah}`;
  });
}

export async function changeLanguage(btn) {
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

    let hadithData = await dataServer.hadithData();
    dataDetails = hadithData.bookDetails;
    isItArabic = dataDetails.isArabicLang;
    appState.siteLang = isItArabic ? "ar" : "en";
  }

  let dir = isItArabic ? "rtl" : "ltr";
  UI.articleContainer.style.direction = dir;
  UI.quoteText.parentElement.style.direction = dir;

  generateQuoteFromJson(dataDetails, translations);
  translateArticleIfExists(dataDetails, articleTitleLang, translations);
}

export async function translateArticleIfExists(data, articleTitleLang, translations) {
  UI.rightSidebar.classList.remove("active");
  if (!UI.articleContainer.hasChildNodes()) return;
  showLoading(UI.articleContainer);
  window.scrollTo(0, 0);

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

  const { showHadithPart, showHadithsList, getQuranPart, subBox } = await import("./sidebar.js");
  const { getQuranPart: getQuranPartArticle } = await import("./article.js");

  if (key == "sections") showHadithPart(lang, subBtn, btnNumber);
  if (key == "Hadiths") {
    showHadithsList(subBox, btn).then(() => subBox.children[btnNumber - 1].click());
    return;
  }
  if (key == "juzs" || key == "pages") getQuranPartArticle(btn, key);
  else if (Number.isInteger(+key)) {
    btnNumber = btn.dataset.number;
    getQuranPartArticle(subBtn, btnNumber);
  }
}
