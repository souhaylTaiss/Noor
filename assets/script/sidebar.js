// ==================== Sidebar / Search ====================
import { UI, createElements, activateElement } from "./elements.js";
import { appState } from "./state.js";
import { dataServer } from "./data.js";
import { showLoading, hideLoading } from "./loading.js";
import { HadithService } from "./hadith.js";
import { getQuranPart, showHadithPart } from "./article.js";
import { showBook } from "./main.js";

export let subBox = createElements("ul").ul;
subBox.classList.add("sub-box");

export function createListInSidebar(obj, box, entry, checkBook = false) {
  box.innerHTML = "";

  for (let key in obj) {
    if (entry === "language" && checkBook) {
      addElements(key, entry, "author", "direction");
    } else if (entry === "font") {
      addElements(key, entry, "name", "woff2", "woff", "ttf");
    } else {
      box.innerHTML = appState.siteLang == "en"
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
      elements.li.dataset[dataName] = obj[key][dataName] || obj[key]["original"];
    });
    elements.li.append(elements.span);
    box.append(elements.li);
  }
}

export function addBookOptions(data, dataInfo) {
  UI.bookOptionContainer.innerHTML = "";
  let contentLang = appState.siteLang == "ar" ? "content" : "data";

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

export async function getSpecificParts(li, dataInfo) {
  let key = li.dataset.engName;
  const translations = await dataServer.translationsData;
  let ul = createElements("ul").ul;

  let keys = {
    dataInfo: dataInfo[key],
    key1: "name",
    key2: "arabicname",
    keyFilter: key,
    translations,
    ul,
  };

  if (key === "chapters" || key === "verses") {
    if (key === "verses") key = "chapters";
    keys.dataInfo = dataInfo[key];
    keys.keyFilter = key;
    showMatchData(keys);
  } else if (key === "juzs") {
    keys.dataInfo = dataInfo[key].references;
    keys.key1 = "juz";
    keys.key2 = "جزء";
    showMatchData(keys);
  } else if (key === "pages") {
    keys.dataInfo = dataInfo[key].references;
    keys.key1 = "page";
    keys.key2 = "صفحة";
    showMatchData(keys);
  } else {
    keys.dataInfo = Object.values(translations[appState.siteLang].hadith.booksName);
    keys.key1 = "booksName";
    keys.key2 = "كتاب";
    showMatchData(keys);
  }

  ul.style.flexGrow = 1;
  UI.searchResultBox.append(ul);
}

export function showMatchData({ dataInfo: chaptersInfo, key1, key2, keyFilter, translations, ul }) {
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
    } else if (keyFilter == "Books" || keyFilter == "sections" || keyFilter == "Hadiths") {
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

export async function renderContent(btn, ul, chaptersInfo) {
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
    createListInSidebar(hadithData.languagesOfBook, UI.languageSelector, "language", true);
  }

  appState.bookNumber = btnNumber;
  if (engName == "Books") showBook(btn);
  else if (engName == "sections") showSectionsList(subBox, btnNumber);
  else if (engName == "Hadiths") showHadithsList(subBox, btn);
}

export async function showSectionsList(subBox, btnNumber) {
  UI.subInputSearch.innerHTML = "";
  subBox.innerHTML = "";
  let lang = appState.hadithLang[btnNumber - 1];
  const translations = await dataServer.translationsData;
  let sections = translations[appState.siteLang].hadith.bookSections[btnNumber - 1];

  sections.forEach((section, ind) => {
    let li = createElements("li").li;
    li.dataset.number = ind + 1;
    li.dataset.latinName = translations["en"].hadith.bookSections[btnNumber - 1][ind];
    li.dataset.arabicName = translations["ar"].hadith.bookSections[btnNumber - 1][ind];
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

export async function showHadithsList(subBox) {
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
    li.addEventListener("click", () => showHadithContent(li, lang, hadiths));
    subBox.append(li);
  }

  UI.subInputSearch.classList.remove("hidden");
  UI.searchResultBox.append(subBox);
  hideLoading(subBox);
}

export function showHadithContent(li, lang, hadiths) {
  let hadithNum = li.dataset.number;
  let elements = createElements("page=div", "content=p", "detail=p");
  UI.leftSidebar.classList.remove("active");

  UI.articleContainer.innerHTML = "";
  UI.articleContainer.dataset.number = hadithNum;
  UI.articleContainer.dataset.key = "Hadiths";

  activateElement(subBox.children, li);

  elements.page.className = "page";
  elements.content.innerHTML = hadiths[hadithNum - 1].text;
  elements.detail.innerHTML = (appState.siteLang == "ar" || lang.startsWith("ar"))
    ? li.dataset.arabicName
    : li.dataset.latinName;

  elements.content.append(elements.detail);
  elements.page.append(elements.content);
  UI.articleContainer.append(elements.page);
}

export function showVersesList(btnNumber, subBox, dataInfo) {
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

// Search
let noResultMsg = createElements("p").p;
noResultMsg.className = "no-result-msg";
noResultMsg.dataset.latinName = "No result!";
noResultMsg.dataset.arabicName = "لا نتائج!";

export function handleSearch(ele, boxNum) {
  noResultMsg.innerHTML = appState.siteLang == "ar" ? "لا نتائج!" : "No result!";
  const box = UI.searchResultBox?.children[boxNum];
  const searchText = ele.target.value;
  const options = [...(box?.children || [])];

  box?.append(noResultMsg);

  options.forEach((opt) => {
    opt.style.display = "none";
    let span = opt.querySelector("span");
    span?.replaceWith(span.innerHTML);
  });

  const regPattern = /[\u064B-\u0652\u0653\u0670\u06D6-\u06ED]/g;
  let matchesList = options.filter((opt) => {
    opt.innerHTML = opt.innerHTML.replace(regPattern, "");
    return opt.innerHTML.match(searchText);
  });

  matchesList.forEach((li) => {
    li.style.display = "block";
    li.innerHTML = li.innerHTML.replace(searchText, `<span>${searchText}</span>`);
  });

  noResultMsg.style.display = matchesList.length ? "none" : "block";
}
