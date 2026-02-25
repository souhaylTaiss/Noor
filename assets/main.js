// Script
const jsonUrls = {
  quran:
    "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.min.json",
  quranInfo: "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/info.json",
  hadith:
    "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.min.json",
  font: "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/fonts.json",
};

const translitions = {
  ar: {
    quranBtn: "القران",
    hadithBtn: "الحديث",
    inputSearch: "ابحث عن اية او حديث",
    settings: "الاعدادات",
    suggestBtn: "إقتراح",
    autoSuggestBtn: "إقتراح آلي",
    ayah: "اية",
    fontSize: "حجم الخط",
    languages: "لغات القران",
    fontsFamily: "الخطوط",
    websiteLanguage: "لغة الموقع",
  },
  en: {
    quranBtn: "Quran",
    hadithBtn: "Hadith",
    inputSearch: "Search for Aya or Hadith",
    settings: "Settings",
    suggestBtn: "Suggest",
    autoSuggestBtn: "Auto suggest",
    ayah: "Ayah",
    fontSize: "Font size",
    languages: "Quran Languages",
    fontsFamily: "Fonts",
    websiteLanguage: "Website language",
  },
};

const UI = {
  burgerMenuBtn: document.querySelector(".menu"),
  closeBtn: document.querySelector(".close-btn"),
  websiteLanguagesList: document.querySelectorAll(".website-language-box li"),
  sidebar: document.querySelector("aside"),
  languageSelector: document.querySelector(".language-box"),
  fontSelector: document.querySelector(".fonts-box"),
  fontSizeInput: document.querySelector("aside .box input"),
  inputSearch: document.querySelector("input[type='search']"),
  quoteText: document.querySelector(".quote-generator p"),
  chaptersList: document.getElementById("chapters-container"),
  heroSection: document.querySelector(".hero-section"),
  generateBtn: document.querySelector(".generator .btn:first-child"),
  autoGenerateBtn: document.querySelector(".generator .btn:last-child"),
  apiButtons: document.querySelectorAll(".api-btn button"),
  pausePlayIcon: document.querySelector(".btn span"),
  articleContainer: document.querySelector("article .container"),
};

UI.burgerMenuBtn.addEventListener("click", () =>
  UI.sidebar.classList.add("active")
);

UI.closeBtn.addEventListener("click", () =>
  UI.sidebar.classList.remove("active")
);

// Check localStorage

let allQuranLangPromise, quranInfoPromise, hadithPromise, fontsPromise;

if (localStorage.api === "Hadith") {
  hadithPromise = fetchUrl(jsonUrls.hadith);
} else {
  allQuranLangPromise = fetchUrl(jsonUrls.quran);
  quranInfoPromise = fetchUrl(jsonUrls.quranInfo);
}

if (localStorage.lang !== undefined) {
  document.documentElement.lang = localStorage.lang;
  document.documentElement.dir = localStorage.dir;
  fetchUrl(localStorage.link);
}

if (localStorage.font !== undefined) {
  fetchUrl(localStorage.link);
} else {
  fontsPromise = fetchUrl(jsonUrls.font);
}

async function fetchUrl(url) {
  let response = await fetch(url);
  let jsonData = await response.json();
  return jsonData;
}
//  hadithPromise = fetchUrl(jsonUrls.hadith);

// async function getHadith() {
//   let data = await hadithPromise;
//   console.log(data);

//   let link = await fetchUrl(data.malik.collection[1].linkmin);
//   for (let i = 0; i < 100 ; i++) {
//     console.log(link.hadiths[i].text)

//   }
// }
// getHadith()
// Change language

UI.websiteLanguagesList.forEach((btn) => {
  btn.addEventListener("click", () => {
    UI.websiteLanguagesList[0].classList = "";
    UI.websiteLanguagesList[1].classList = "";
    setLanguage(btn.dataset.lang);
    btn.classList = "active";
  });
});

async function setLanguage(lang = "ar") {
  let chaptersInfo, isArabic, dir, elements;

  chaptersInfo = (await quranInfoPromise).chapters;
  isArabic = lang === "ar" ? true : false;
  dir = isArabic ? "rtl" : "ltr";
  elements = document.querySelectorAll("[data-i18n]");

  UI.chaptersList.innerHTML = "";
  createChapterBox(chaptersInfo);
  elements.forEach((ele) => {
    ele.innerHTML = translitions[lang][ele.dataset.i18n];
    ele.dir = dir;
  });

  UI.inputSearch.setAttribute("placeholder", translitions[lang].inputSearch);
  UI.chaptersList.dir = dir;
  UI.sidebar.querySelector(".title").classList.toggle("direction");

  changeChapterBoxlanguage(isArabic, chaptersInfo);
}
setLanguage();


function createChapterBox(allChapters) {
  allChapters.forEach((chapter, ind) => {
    let elements = createElements(
      "chapterBox=div",
      "div",
      "span",
      "spanNum=span",
      "img",
      "h2"
    );

    elements.span.dataset.i18n = "ayah";
    elements.h2.innerHTML = chapter.arabicname;
    elements.span.innerHTML = chapter.verses.length + "اية";
    elements.chapterBox.className = "chapter";
    elements.chapterBox.dataset.number = ind + 1;
    elements.spanNum.innerHTML = ind + 1;
    elements.img.src = "./assets/images/icons/aya-num.svg";
    elements.div.append(elements.spanNum, elements.img);
    elements.chapterBox.append(elements.div, elements.h2, elements.span);
    UI.chaptersList.append(elements.chapterBox);
  });
}

function changeChapterBoxlanguage(isArabic, chaptersInfo) {
  let name = "name",
    leftValue = "auto",
    rightValue = "13px",
    ayah = "Ayah";

  if (isArabic) {
    name = "arabicname";
    [leftValue, rightValue] = [rightValue, leftValue];
    ayah = "اية";
  }

  UI.chaptersList.querySelectorAll(".chapter").forEach((ele, ind) => {
    ele.children[1].innerHTML = chaptersInfo[ind][name];
    ele.children[2].style.left = leftValue;
    ele.children[2].style.right = rightValue;
    ele.children[2].innerHTML = `${chaptersInfo[ind].verses.length} ${ayah}`;
  });
}

UI.fontSizeInput.addEventListener("input", (ele) => {
  [UI.quoteText, UI.articleContainer].forEach(
    (el) => (el.style.fontSize = ele.target.value + "px")
  );
});

// Change fonts

let elementsFont = document.querySelectorAll(".font-family");
let styleElement = document.createElement("style");
document.head.append(styleElement);
let counter = 0;

async function getAllFonts() {
  let fontData, fontsList;

  fontData = await fontsPromise;

  createListInSidebar(fontData, "font", "name", "woff", UI.fontSelector);
  fontsList = document.querySelectorAll(".fonts-box li");

  fontsList.forEach((li) => {
    li.addEventListener("click", () => {
      activateElement(fontsList, li);
      addFontToStyle(li);

      elementsFont.forEach((ele) => {
        ele.style.fontFamily = `${li.dataset.fontName}`;
      });
    });
  });
}
getAllFonts();

function addFontToStyle(li) {
  let fontName, fontFace, isIncludeFont;
  fontName = `font${counter}`;
  isIncludeFont = styleElement.innerHTML.includes(li.dataset.fontName);
  fontFace = `
          @font-face {
            font-family: '${fontName}';
            src: url('${li.dataset.link}2') format('woff2'),
                url('${li.dataset.link}') format('woff'),
                url('${li.dataset.link}') format('ttf');
          }`;

  if (!isIncludeFont) {
    styleElement.append(fontFace);
    li.dataset.fontName = fontName;
    counter++;
  }
}

// Get Quran

async function excludeLatinLanguage() {
  const jsonData = await allQuranLangPromise;
  let filteredData = {};
  for (let key in jsonData) {
    if (/_lad?/i.test(key)) continue;
    filteredData[key] = jsonData[key];
  }
  createListInSidebar(
    filteredData,
    "language",
    "author",
    "direction",
    UI.languageSelector
  );
  return filteredData;
}
let filteredLanguages = excludeLatinLanguage();

function createListInSidebar(obj, entry1, entry2, entry3, box) {
  let dataName1 = null,
    dataName2 = null;

  if (entry1 === "font") {
    [dataName1, dataName2] = ["fontName", "link"];
  }
  for (let key in obj) {
    let elements = createElements("li", "span");
    elements.li.dataset[dataName1 || "lang"] = key;
    elements.li.dataset[dataName2 || "direction"] =
      obj[key][entry3] || obj[key].original;
    elements.li.innerHTML = obj[key][entry1];
    elements.span.innerHTML = `   (${obj[key][entry2]})`;
    elements.li.append(elements.span);
    box.append(elements.li);
  }
}

UI.languageSelector.addEventListener("click", (ele) => {
  let language, direction;

  let li = ele.target.closest("[data-lang]");
  activateElement(UI.languageSelector.children, li);

  if (li !== null) {
    language = ele.target.dataset.lang;
    direction = ele.target.dataset.direction;
  }
  getQuranByLang(language, direction);
});

function activateElement([...elements], li) {
  elements.forEach((li) => li.classList.remove("active"));
  li.classList.add("active");
  li.parentElement.scrollTo(0, li.offsetTop);
}

async function getQuranByLang(language = "ara_quranwarsh", direction) {
  let jsonData,
    chaptersInfo,
    languageUrl,
    quranJsonData,
    quran,
    articleTitleLang

  jsonData = await filteredLanguages;
  chaptersInfo = (await quranInfoPromise).chapters;

  languageUrl = jsonData[language].linkmin;
  quranJsonData = await fetchUrl(languageUrl);

  quran = quranJsonData.quran;
  UI.articleContainer.dir = direction;
  UI.quoteText.parentElement.dir = direction;

  articleTitleLang = language.startsWith("ara") ? "arabicname" : "name";
  UI.chaptersList.addEventListener("click", (element) => {
    let button = element.target.closest(".chapter");
    if (!button) return;
    let chapterNum = button.dataset.number;
    let chapterName = chaptersInfo[chapterNum - 1][articleTitleLang];
    showChapterText(chapterName, chapterNum, chaptersInfo, quran);
  });

  translateArticleIfExists(chaptersInfo,quran,articleTitleLang)
  generateQuoteFromJson(chaptersInfo, quran, language);
}
getQuranByLang();

function translateArticleIfExists(chaptersInfo, quran, articleTitleLang) {
  let articleChildren = UI.articleContainer.children;

  if (articleChildren.length) {
    let chapterNum = UI.articleContainer.dataset.chapterNum;
    let chapterName = chaptersInfo[chapterNum - 1][articleTitleLang];
    showChapterText(chapterName, +chapterNum, chaptersInfo, quran);
  }
}

// Generate quote

let generateHandler = null;
let autoGenerateHandler = null;

function generateQuoteFromJson(chaptersInfo, verses, language) {
  generateQuote(chaptersInfo, verses, language);

  if (generateHandler && autoGenerateHandler) {
    UI.generateBtn.removeEventListener("click", generateHandler);
    UI.autoGenerateBtn.removeEventListener("click", autoGenerateHandler);
  }

  generateHandler = (_) => generateQuote(chaptersInfo, verses, language);
  UI.generateBtn.addEventListener("click", generateHandler);

  autoGenerateHandler = (_) => autoGenerateQuote(chaptersInfo, verses, language);
  UI.autoGenerateBtn.addEventListener("click", autoGenerateHandler);
}

let intervalId;
let isGenerating = false;
let shrinkingBar = document.querySelector(".shrinking-bar span");

function autoGenerateQuote(quranChapters, verses, language) {
  UI.pausePlayIcon.classList.toggle("pause-play");

  if (isGenerating) {
    clearInterval(intervalId);
    shrinkingBar.style.width = "100%";
    isGenerating = false;
    return;
  }

  generateQuote(quranChapters, verses, language);
  shrinkingBar.style.width = 0;

  intervalId = setInterval(() => {
    generateQuote(quranChapters, verses, language);
    if (shrinkingBar.clientWidth === 0) {
      shrinkingBar.style.width = "100%";
    } else shrinkingBar.style.width = 0;
  }, 5000);

  isGenerating = true;
}

function generateQuote(chaptersInfo, verses, language) {
  let randomNum = parseInt(Math.random() * verses.length);
  let span = document.querySelector(".quote span");

  for (let surahDetails of chaptersInfo) {
    if (surahDetails.chapter !== verses[randomNum].chapter) continue;
    for (let verseObj of surahDetails.verses) {
      if (verses[randomNum].verse !== verseObj.verse) continue;

      let ayah = "Ayah",
          surah = "from surah",
          title = "name";

      if (language.startsWith("ara")) {
          ayah = "الاية",
          surah = "من"
          title = "arabicname";
      }
    span.innerHTML = ` ${ayah} ${verseObj.verse} ${surah} ${surahDetails[title]} `;
    }
  }
  UI.quoteText.innerHTML = verses[randomNum].text;
}

function showChapterText(
  chapterName,
  currentChapterNum,
  chaptersInfo,
  versesData
) {
  let versesInfo, chapterData;

  versesInfo = chaptersInfo[currentChapterNum - 1].verses;
  chapterData = getChapterData(versesData, +currentChapterNum);
  pages = getPageNumberAndText(chapterData, versesInfo);

  let data = {
    pages: pages,
    chapterName: chapterName,
    chapterNum: currentChapterNum,
    basmala: versesData[0].text,
  };
  createArticle(data);
}

function getChapterData(versesData, chapterNum) {
  return versesData.filter((verseData) => {
    return chapterNum === verseData.chapter;
  });
}

function getPageNumberAndText(chapterData, versesInfo) {
  let pageCounter, pages, textData;

  pageCounter = versesInfo[0].page;
  pages = {};
  textData = [];

  versesInfo.forEach((verse, ind) => {
    if (verse.page > pageCounter) {
      pages[pageCounter] = textData;
      pageCounter = verse.page;
      textData = [];
    }
    textData.push(chapterData[ind]);
  });

  pages[pageCounter] = textData;
  return pages;
}

function createArticle(data) {
  UI.articleContainer.innerHTML = "";

  let firstPage = Object.keys(data.pages)[0];
  for (let ind in data.pages) {
    let elements = createElements(
      "page=div",
      "titleBox=div",
      "title=h2",
      "p",
      "pageText=p",
      "pageNumber=span"
    );

    if (firstPage === ind) {
      UI.articleContainer.dataset.chapterNum = data.chapterNum;
      elements.titleBox.className = "title-box";
      elements.title.innerHTML = data.chapterName;
      elements.p.innerHTML = data.basmala;
      elements.titleBox.append(elements.title, elements.p);
      elements.page.append(elements.titleBox);
    }

    elements.page.className = "page";
    elements.page.append(elements.pageText);

    addTextToPage(data.pages[ind], elements)

    elements.pageNumber.classList.add("page-number");
    elements.pageNumber.innerHTML = ind;
    elements.page.append(elements.pageNumber);
    UI.articleContainer.append(elements.page);
  }
}

function addTextToPage(pageData,elements) {
  pageData.forEach((ayahData) => {
    let versesNumber = document.createElement("span");
    versesNumber.classList.add("verse-number");
    versesNumber.innerHTML = ayahData.verse;
    elements.pageText.append(ayahData.text, versesNumber);
  });
}

function createElements(...elementsName) {
  let elements = {};

  elementsName.forEach((element) => {
    element = element.split("=");
    elements[element[0]] = document.createElement(element[element.length - 1]);
  });

  return elements;
}

// Get fonts
