// Script
const jsonUrls = {
  quran:
    "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.min.json",
  quranInfo: "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/info.json",
  hadith:
    "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.min.json",
  font: "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/fonts.json",
};

const UI = {
  burgerMenuBtn: document.querySelector(".menu"),
  languageBtn: document.querySelector(".language img"),
  languagesList: document.querySelectorAll(".language li"),
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
  UI.sidebar.classList.toggle("toggle")
);

UI.languageBtn.addEventListener("click", () => {
  UI.languageBtn.nextElementSibling.classList.toggle("active");
});

UI.languagesList.forEach((btn) => {
  btn.addEventListener("click", () => {
    UI.languagesList[0].classList = "";
    UI.languagesList[1].classList = "";
    setLanguage(btn.dataset.lang);
    btn.classList = "active";
  });
});

let translitions = {
  ar: {
    quranBtn: "القران",
    hadithBtn: "الحديث",
    inputSearch: "ابحث عن اية او حديث",
    suggestBtn: "إقتراح",
    autoSuggestBtn: "إقتراح آلي",
    ayah: "اية",
    fontSize: "حجم الخط",
    languages: "لغات القران",
    fontsFamily: "الخطوط",
  },
  en: {
    quranBtn: "Quran",
    hadithBtn: "Hadith",
    inputSearch: "Search for Aya or Hadith",
    suggestBtn: "Suggest",
    autoSuggestBtn: "Auto suggest",
    ayah: "Ayah",
    fontSize: "Font size",
    languages: "Quran Languages",
    fontsFamily: "Fonts",
  },
};

UI.fontSizeInput.addEventListener("input", (ele) => {
  [UI.quoteText, UI.articleContainer].forEach(
    (el) => (el.style.fontSize = ele.target.value + "px")
  );
});

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


async function setLanguage(lang = "ar") {
  let chaptersInfo = (await quranInfoPromise).chapters;
  let isArabic = lang === "ar" ? true : false;
  let dir = isArabic ? "rtl" : "ltr";
  let elements = document.querySelectorAll("[data-i18n]");

  UI.chaptersList.innerHTML = "";
  createChapterBox(chaptersInfo);
  elements.forEach((ele) => {
    ele.innerHTML = translitions[lang][ele.dataset.i18n];
    ele.dir = dir;
  });

  UI.inputSearch.setAttribute("placeholder", translitions[lang].inputSearch);
  UI.articleContainer.dir = dir;
  UI.chaptersList.dir = dir;

  if (isArabic) {
    UI.chaptersList.querySelectorAll(".chapter").forEach((ele, ind) => {
      ele.children[1].innerHTML = chaptersInfo[ind].arabicname;
      ele.children[2].style.left = "13px";
      ele.children[2].style.right = "auto";
      ele.children[2].innerHTML = `${chaptersInfo[ind].verses.length} اية`;
    });
  } else {
    UI.chaptersList.querySelectorAll(".chapter").forEach((ele, ind) => {
      ele.children[1].innerHTML = chaptersInfo[ind].name;
      ele.children[2].style.left = "auto";
      ele.children[2].style.right = "13px";
      ele.children[2].innerHTML = `${chaptersInfo[ind].verses.length} Ayah`;
    });
    }

  return ;
}
setLanguage()

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

function activateElement(fontsList, li) {
  fontsList.forEach((li) => li.classList.remove("active"));
  li.classList.add("active");
  li.parentElement.scrollTo(0, li.offsetTop);
}

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

async function fetchUrl(url) {
  let response = await fetch(url);
  let jsonData = await response.json();
  return jsonData;
}

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
    "linkmin",
    UI.languageSelector
  );
  return filteredData;
}
excludeLatinLanguage();

function createListInSidebar(obj, entry1, entry2, link, box) {
  for (let key in obj) {
    let elements = createElements("li", "span");
    elements.li.innerHTML = obj[key][entry1];
    elements.li.dataset.lang = key;
    elements.li.dataset.direction = obj[key].direction;
    elements.span.innerHTML = `   (${obj[key][entry2]})`;
    elements.li.append(elements.span);
    box.append(elements.li);
  }
}

UI.languageSelector.addEventListener("click", (ele) => {
  let language, direction;
  if (ele.target.tagName === "LI") {
    language = ele.target.dataset.lang;
    direction = ele.target.dataset.direction;
  }
  if (ele.target.parentElement.tagName === "LI") {
    language = ele.target.parentElement.dataset.lang;
    direction = ele.target.parentElement.dataset.direction;
  }
  getQuranByLang(language, direction);
});

async function getQuranByLang(language = "ara_quranwarsh",dir) {
  let jsonData = await excludeLatinLanguage();
  let chaptersInfo = (await quranInfoPromise).chapters;

  let languageUrl = jsonData[language].linkmin;
  let quranJsonData = await fetchUrl(languageUrl);

  let quran = quranJsonData.quran;

  UI.chaptersList.addEventListener("click", (element) => {
    let button;
    button = element.target.closest(".chapter");
    if (!button) return;
    let chapterNum = button.dataset.number

    showChapterText(chapterNum, chaptersInfo, quran);
  });
  UI.quoteText.dir = dir;

  let articleChildren = UI.articleContainer.children
  if (articleChildren.length) {
    chapterNum = articleChildren[0].dataset.chapterNumber
    console.log(chapterNum)
     showChapterText(+chapterNum, chaptersInfo, quran);
   }


  generateQuoteFromJson(chaptersInfo, quran, language);
}
getQuranByLang();

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

  autoGenerateHandler = (_) =>
    autoGenerateQuote(chaptersInfo, verses, language);
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
      if (language.startsWith("ara")) {
        span.innerHTML = ` الاية ${verseObj.verse} من ${surahDetails.arabicname} `;
      } else {
        span.innerHTML = ` Ayah ${verseObj.verse} from Surah ${surahDetails.name} `;
      }
    }
  }
  UI.quoteText.innerHTML = verses[randomNum].text;
}

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

function showChapterText(
  currentChapterNum,
  chaptersInfo,
  versesData
) {
  let versesInfo, chapterData,chapterName;
  console.log(currentChapterNum)
  chapterName = chaptersInfo[currentChapterNum - 1].arabicname
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
  let firstPage = Object.keys(data.pages)[0];

  UI.articleContainer.innerHTML = "";
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
      elements.page.dataset.chapterNumber = data.chapterNum;
      elements.titleBox.className = "title-box";
      elements.title.innerHTML = data.chapterName;
      elements.p.innerHTML = data.basmala;
      elements.titleBox.append(elements.title, elements.p);
      elements.page.append(elements.titleBox);
    }

    elements.page.className = "page";
    elements.page.append(elements.pageText);

    data.pages[ind].forEach((ayahData) => {
      let versesNumber = document.createElement("span");
      versesNumber.classList.add("verse-number");
      versesNumber.innerHTML = ayahData.verse;
      elements.pageText.append(ayahData.text, versesNumber);
    });

    elements.pageNumber.classList.add("page-number");
    elements.pageNumber.innerHTML = ind;
    elements.page.append(elements.pageNumber);
    UI.articleContainer.append(elements.page);
  }
}

function createElements(...elementsName) {
  let elements = {};
  elementsName.forEach((element) => {
    element = element.split("=");
    if (element.length == 2) {
      elements[element[0]] = document.createElement(element[1]);
    } else {
      elements[element[0]] = document.createElement(element[0]);
    }
  });
  return elements;
}

// Get fonts
