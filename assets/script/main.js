// Script
import { getAllFonts } from "./fonts.js";
import { QuranService } from "../script/quran.js";
import { HadithService } from "../script/hadith.js";
import { fetchUrl } from "./utils.js";

const UI = {
  burgerMenuBtn: document.querySelector(".menu"),
  closeBtn: document.querySelector(".close-btn"),
  websiteLanguagesList: document.querySelectorAll(".website-language-box li"),
  sidebar: document.querySelector("aside"),
  languageSelector: document.querySelector(".language-box"),
  fontSelector: document.querySelector(".fonts-box"),
  fontSizeIncrease: document.querySelector("aside .box .increase"),
  fontSizeDecrease: document.querySelector("aside .box .reduce"),
  quranBtn: document.querySelector(".api-btn button:first-child"),
  hadithBtn: document.querySelector(".api-btn button:last-child"),
  inputSearch: document.querySelector("input[type='search']"),
  quoteText: document.querySelector(".quote-generator p"),
  quoteDetails: document.querySelector(".quote span"),
  chaptersList: document.getElementById("chapters-container"),
  heroSection: document.querySelector(".hero-section"),
  generateBtn: document.querySelector(".generator .btn:first-child"),
  autoGenerateBtn: document.querySelector(".generator .btn:last-child"),
  pausePlayIcon: document.querySelector(".btn span"),
  articleContainer: document.querySelector("article .container"),
};

let language = "ara_quranwarsh";
let direction = "rtl";
let articleTitleLang = "arabicname";

UI.burgerMenuBtn.addEventListener("click", () =>
  UI.sidebar.classList.add("active")
);

UI.closeBtn.addEventListener("click", () =>
  UI.sidebar.classList.remove("active")
);

// Change language
let isItQuran = true;

UI.websiteLanguagesList.forEach((btn) => {
  btn.addEventListener("click", () => {
    UI.websiteLanguagesList[0].classList = "";
    UI.websiteLanguagesList[1].classList = "";
    let lang = btn.dataset.lang;
    let dir = btn.dataset.dir;
    setLanguage(lang, dir);
    btn.classList = "active";
  });
});

async function setLanguage(lang = "ar", dir = "rtl") {
  let chaptersInfo, elements;

  if (isItQuran) {
    chaptersInfo = (await QuranService.getQuranByLang(language)).chaptersInfo;
    changeChapterBoxLanguage(lang, chaptersInfo);
  }

  let translations = await fetchUrl("./assets/script/translations.json");

  elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((ele) => {
    const path = ele.dataset.i18n.split(".");
    let text = translations[lang];
    path.forEach((key) => {
      text = text[key];
    });
    ele.innerHTML = text;
    ele.dir = dir;
  });

  UI.inputSearch.setAttribute("placeholder", translations[lang].UI.inputSearch);
  UI.chaptersList.dir = dir;
  UI.sidebar.querySelector(".title").classList.toggle("direction");
}
setLanguage();

function changeChapterBoxLanguage(lang, chaptersInfo) {
  let name = "name",
    leftValue = "auto",
    rightValue = "13px",
    ayah = "Ayah";

  if (lang === "ar") {
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

let fontSize = 22;
let scale = 1;
let range = 1;
UI.fontSizeIncrease.addEventListener("click", () => {
  if (range === 10) {
    UI.fontSizeIncrease.style.opacity = ".5";

    return;
  } else {
    UI.fontSizeIncrease.style.opacity = "1";
    UI.fontSizeDecrease.style.opacity = "1";
  }

  fontSize++;
  range++;
  scale += 0.1;
  scale = +scale.toFixed(1);
  UI.fontSizeIncrease.nextElementSibling.innerHTML = range;
  UI.quoteText.style.fontSize = `${fontSize}px`;
  UI.articleContainer.style.transform = `scale(${scale})`;
});

UI.fontSizeDecrease.addEventListener("click", () => {
  if (range === 1) {
    UI.fontSizeDecrease.style.opacity = ".5";
    return;
  } else {
    UI.fontSizeIncrease.style.opacity = "1";
    UI.fontSizeDecrease.style.opacity = "1";
  }

  fontSize--;
  range--;
  scale -= 0.1;
  scale = +scale.toFixed(1);
  UI.quoteText.style.fontSize = `${fontSize}px`;
  UI.fontSizeIncrease.nextElementSibling.innerHTML = range;
  UI.articleContainer.style.transform = `scale(${scale})`;
});

// Set fonts
let elementsFont = document.querySelectorAll(".font-family");
let styleElement = document.createElement("style");
document.head.append(styleElement);

async function setupFontOptions() {
  const fontsData = await getAllFonts();
  createListInSidebar(fontsData, UI.fontSelector, "font");
  let fontsList = document.querySelectorAll(".fonts-box li");

  fontsList.forEach((li) => {
    li.addEventListener("click", () => {
      activateElement(fontsList, li);
      addFontToStyle(li);

      elementsFont.forEach((ele) => {
        ele.style.fontFamily = `${li.dataset.font}`;
      });
    });
  });
}

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

UI.quranBtn.addEventListener("click", async () => {
  const quranLanguages = await QuranService.filteredLanguages();
  const quranData = await QuranService.getQuranByLang(language);
  const chaptersInfo = quranData.chaptersInfo;
  isItQuran = true;
  initApp(quranData, chaptersInfo, quranLanguages);
});

UI.hadithBtn.addEventListener("click", async () => {
  const hadithData = await HadithService.hadithData();
  const hadithLanguages = hadithData.languagesOfBook;
  const books = hadithData.hadithBooks;
  const bookDetails = hadithData.bookDetails.hadiths;
  isItQuran = false;
  initApp(bookDetails, books, hadithLanguages);
});

// Get Quran
async function initApp(data, dataInfo, languages) {
  const translations = await fetchUrl("./assets/script/translations.json");
  UI.articleContainer.innerHTML = "";
  createListInSidebar(languages, UI.languageSelector, "language");
  createChapterBox(dataInfo, translations);
  changeLanguageWhenClick();
  showBookWhenClick();
  generateQuoteFromJson(data);
}

function showBookWhenClick() {
  let booksBox = UI.chaptersList.querySelectorAll("[data-number]");

  booksBox.forEach((li) => {
    li.addEventListener("click", async () => {
      let dataNumber = +li.dataset.number;

      if (isItQuran) {
        const quranData = await QuranService.getQuranByLang(language);
        const quran = quranData.quran;
        const chaptersInfo = quranData.chaptersInfo;

        let title = chaptersInfo[dataNumber][articleTitleLang];
        createArticle([title, dataNumber + 1, chaptersInfo, quran]);
      } else {
        const hadithData = await HadithService.hadithData(dataNumber);
        const translations = await fetchUrl("./assets/script/translations.json");
        const bookDetails = hadithData.bookDetails;

        let title = bookDetails.bookName;
        let sections = bookDetails.sections;
        let languages = hadithData.languagesOfBook;

        createListInSidebar(languages, UI.languageSelector, "language");
        changeLanguageWhenClick();
        generateQuoteFromJson(bookDetails.hadiths);

        let isItArabic = language.startsWith("ara");
        let lang = isItArabic ? "ar" : "en";
        createTextBook([title, dataNumber, sections], translations, lang);
      }
    });
  });
}

function createTextBook(bookData, translations, lang = "ar") {
  UI.articleContainer.innerHTML = "";
  let [bookName, bookNumber, sections] = bookData;

  let title = createElements("h1").h1;
  title.innerHTML = translations[lang].hadith.booksName[bookNumber];
  UI.articleContainer.dataset.bookNumber = bookNumber;

  for (let ind in sections) {
    let subTitle = createElements("h2").h2;
    subTitle.innerHTML = translations[lang].hadith.bookSections[bookName][ind];

    let isItNewSection = true;
    for (let i in sections[ind].content) {
      let elements = createElements(
        "page=div",
        "titleBox=div",
        "subTitle=h2",
        "textBox=div",
        "pageNumber=span"
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
        let text = createElements("p").p;
        text.innerHTML = hadith.text;
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
      "pageNumber=span"
    );

    if (firstPage === ind) {
      UI.articleContainer.dataset.chapterNum = chapterNum;
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

function addTextToPage(pageData, elements) {
  pageData.forEach((ayahData) => {
    let versesNumber = document.createElement("span");
    versesNumber.classList.add("verse-number");
    versesNumber.innerHTML = ayahData.verse;
    elements.pageText.append(ayahData.text, versesNumber);
  });
}

// ok
function createListInSidebar(obj, box, entry) {
  box.innerHTML = "";
  for (let key in obj) {
    if (entry === "language") {
      addElements(key, entry, "author", "direction");
    } else if (entry === "font") {
      addElements(key, entry, "name", "woff2", "woff", "ttf");
    }
  }

  function addElements(key, entry1, entry2, ...entry3) {
    let elements = createElements("li", "span");
    let details = obj[key][entry2] || obj[key]["name"];
    elements.li.dataset[entry1] = key;
    elements.li.innerHTML = obj[key][entry1];
    elements.span.innerHTML = `   (${details})`;

    entry3.forEach((dataName) => {
      elements.li.dataset[dataName] = obj[key][dataName];
    });

    elements.li.append(elements.span);
    box.append(elements.li);
  }
}

// ok
function createChapterBox(allChapters, translations) {
  let isItArabic = language.startsWith("ara");
  let lang = isItArabic ? "ar" : "en";
  let name = isItArabic ? "arabicname" : "name";

  UI.chaptersList.innerHTML = "";
  allChapters.forEach((chapter, ind) => {
    let elements = createElements(
      "chapterBox=div",
      "div",
      "span",
      "spanNum=span",
      "img",
      "h2"
    );

    if (isItQuran) {
      let span = createElements("span").span;
      span.dataset.i18n = "UI.ayah";
      span.innerHTML = " اية";
      elements.span.append(chapter.verses.length, span);
      elements.h2.innerHTML = chapter[name];
    } else {
      elements.h2.innerHTML = translations[lang].hadith.booksName[ind];
      elements.h2.dataset.i18n = "hadith.booksName." + ind;
    }

    elements.chapterBox.className = "chapter";
    elements.chapterBox.dataset.number = ind;
    elements.spanNum.innerHTML = ind + 1;
    elements.img.src = "./assets/images/icons/aya-num.svg";
    elements.div.append(elements.spanNum, elements.img);
    elements.chapterBox.append(elements.div, elements.h2, elements.span);
    UI.chaptersList.append(elements.chapterBox);
  });
}

function changeLanguageWhenClick(articleTitleLang) {
  let languagesList = UI.languageSelector.querySelectorAll("li");

  languagesList.forEach((li) => {
    li.addEventListener("click", async () => {
      language = li.dataset.language;
      direction = li.dataset.direction;
      let isItArabic = language.startsWith("ara");

      let lang = isItArabic ? "ar" : "en";
      articleTitleLang = isItArabic ? "arabicname" : "name";

      let dataDetails, textData;

      if (isItQuran) {
        dataDetails = await QuranService.getQuranByLang(language);
      } else {
        let bookNumber = UI.articleContainer.dataset.bookNumber;
        let hadithData = await HadithService.hadithData(bookNumber, language);
        dataDetails = hadithData.bookDetails;
        textData = dataDetails.hadiths;
      }
      let translations = await fetchUrl("./assets/script/translations.json");

      UI.articleContainer.dir = direction;
      UI.quoteText.parentElement.dir = direction;

      activateElement(languagesList, li);
      generateQuoteFromJson(textData || dataDetails);
      translateArticleIfExists(
        dataDetails,
        articleTitleLang,
        translations,
        lang
      );
    });
  });
}

function activateElement([...elements], li) {
  elements.forEach((li) => li.classList.remove("active"));
  li.classList.add("active");
  li.parentElement.scrollTo(0, li.offsetTop);
}

let generateHandler = null;
let autoGenerateHandler = null;

async function generateQuoteFromJson(data) {
  generate(data);

  if (generateHandler && autoGenerateHandler) {
    UI.generateBtn.removeEventListener("click", generateHandler);
    UI.autoGenerateBtn.removeEventListener("click", autoGenerateHandler);
  }

  generateHandler = (_) => generate(data);
  UI.generateBtn.addEventListener("click", generateHandler);

  autoGenerateHandler = (_) => autoGenerateQuote(data);
  UI.autoGenerateBtn.addEventListener("click", autoGenerateHandler);
}

let intervalId;
let isGenerating = false;
let shrinkingBar = document.querySelector(".shrinking-bar span");

function autoGenerateQuote(data) {
  UI.pausePlayIcon.classList.toggle("pause-play");

  if (isGenerating) {
    clearInterval(intervalId);
    shrinkingBar.style.width = "100%";
    isGenerating = false;
    return;
  }

  generate(data);
  shrinkingBar.style.width = 0;

  intervalId = setInterval(() => {
    generate(data);
    if (shrinkingBar.clientWidth === 0) {
      shrinkingBar.style.width = "100%";
    } else shrinkingBar.style.width = 0;
  }, 5000);

  isGenerating = true;
}

// for hadith
async function generate(data) {
  if (isItQuran) {
    let randomAyah = QuranService.getRandomVerse(data);
    UI.quoteText.innerHTML = randomAyah.verseText;
    UI.quoteDetails.innerHTML = `${randomAyah.ayah} ${randomAyah.verseNumber} ${randomAyah.surah} ${randomAyah.surahName}`;
  } else {
    let textObj = HadithService.getRandomHadith(data);
    UI.quoteText.innerHTML = textObj.hadith;
    UI.quoteDetails.innerHTML = ` ${textObj.hadithNumber} `;
  }
}

async function translateArticleIfExists(
  data,
  articleTitleLang,
  translations,
  lang
) {
  let articleChildren = UI.articleContainer.children;
  if (!articleChildren.length) return;

  if (isItQuran) {
    let chapterNum = +UI.articleContainer.dataset.chapterNum;
    let chapterName = data.chaptersInfo[chapterNum - 1][articleTitleLang];
    createArticle([chapterName, +chapterNum, data.chaptersInfo, data.quran]);
  } else {
    createTextBook(
      [data.bookName, data.bookNumber, data.sections],
      translations,
      lang
    );
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
