// Script
import { getAllFonts } from "./fonts.js";
import { QuranService } from "../script/quran.js";
import { HadithService } from "../script/hadith.js";

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
  quoteDetails: document.querySelector(".quote span"),
  chaptersList: document.getElementById("chapters-container"),
  heroSection: document.querySelector(".hero-section"),
  generateBtn: document.querySelector(".generator .btn:first-child"),
  autoGenerateBtn: document.querySelector(".generator .btn:last-child"),
  apiButtons: document.querySelectorAll(".api-btn button"),
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

  chaptersInfo = (await QuranService.getQuranByLang()).chaptersInfo;

  isArabic = lang === "ar" ? true : false;
  dir = isArabic ? "rtl" : "ltr";
  elements = document.querySelectorAll("[data-i18n]");

  elements.forEach((ele) => {
    ele.innerHTML = translitions[lang][ele.dataset.i18n];
    ele.dir = dir;
  });

  UI.inputSearch.setAttribute("placeholder", translitions[lang].inputSearch);
  UI.chaptersList.dir = dir;
  UI.sidebar.querySelector(".title").classList.toggle("direction");

  changeChapterBoxlanguage(isArabic, chaptersInfo);
}
// setLanguage();

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


let isItQuran = false;

if (isItQuran) {
  initAppQuran()
} else {
  initAppHadith()
}

// Get Quran
async function initAppQuran() {
  const quranLanguages = await QuranService.filteredLanguages();
  console.log(language)
  const quran = await QuranService.getQuranByLang(language);
const chaptersInfo = quran.chaptersInfo
  createListInSidebar(
    quranLanguages,
    UI.languageSelector,
    "language"
  );
  createChapterBox(chaptersInfo, true);
  changeLanguageWhenClick()
  showBookWhenclick();
  generateQuoteFromJson(quran)
//   setupFontOptions()
}

// initApp();
async function initAppHadith() {
  const hadithData = await HadithService.hadithData();

  let languages = hadithData.languagesOfBook;
  let books = hadithData.hadithBooks;
  const bookDetails =  hadithData.bookDetails;

  createListInSidebar(languages, UI.languageSelector, "language");
  createChapterBox(books);
  changeLanguageWhenClick();
  showBookWhenclick();
  generateQuoteFromJson(bookDetails.hadiths);
  // setupFontOptions()
}

function showBookWhenclick() {
  let booksBox = UI.chaptersList.querySelectorAll("[data-number]");

  booksBox.forEach((li) => {
    li.addEventListener("click", async () => {
      let dataNumber = +li.dataset.number;

      if (isItQuran) {
        const quranData = await QuranService.getQuranByLang(language);
        const quran = quranData.quran;
        const chaptersInfo = quranData.chaptersInfo;

        let title = chaptersInfo[dataNumber - 1][articleTitleLang];
        createArticle([title, dataNumber, chaptersInfo, quran]);
      } else {
        const hadithData = await HadithService.hadithData(dataNumber);
        const bookDetails = hadithData.bookDetails;

        let title = bookDetails.title;
        let sections = bookDetails.sections;
        let languages = hadithData.languagesOfBook;

        createListInSidebar(languages, UI.languageSelector, "language");
        changeLanguageWhenClick();
        generateQuoteFromJson(bookDetails.hadiths);

        createTextBook([title, dataNumber, sections]);
      }
    });
  });
}

// function showChapterWhenclick() {
//   let chaptersBox = UI.chaptersList.querySelectorAll("[data-number]");

//   chaptersBox.forEach((li) => {
//     li.addEventListener("click", async () => {
//       const quranData = await QuranService.getQuranByLang(language);
//       const quran = quranData.quran;
//       const chaptersInfo = quranData.chaptersInfo;

//       let chapterNum = +li.dataset.number;
//       let chapterName = chaptersInfo[chapterNum - 1][articleTitleLang];
//       createArticle([chapterName, chapterNum, chaptersInfo, quran]);
//     });
//   });
// }

function createTextBook(bookData) {
  UI.articleContainer.innerHTML = "";
  let [bookName, bookNumber, sections] = bookData;

  let title = createElements("h1").h1;
  title.innerHTML = bookName;
  UI.articleContainer.dataset.bookNumber = bookNumber;

  for (let ind in sections) {
    let subTitle = createElements("h2").h2;
    subTitle.innerHTML = sections[ind].sectionTitle;

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
    console.log("this is key", key)
    elements.li.dataset[entry1] = key ;
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
function createChapterBox(allChapters, isQuran) {
  allChapters.forEach((chapter, ind) => {
    let elements = createElements(
      "chapterBox=div",
      "div",
      "span",
      "spanNum=span",
      "img",
      "h2"
    );

    if (isQuran) {
      elements.span.dataset.i18n = "ayah";
      elements.span.innerHTML = chapter.verses.length + "اية";
    }

    elements.h2.innerHTML = chapter.name;
    elements.chapterBox.className = "chapter";
    elements.chapterBox.dataset.number = ind + 1;
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
      console.log(language)
      direction = li.dataset.direction;
      articleTitleLang = language.startsWith("ara") ? "arabicname" : "name";

      let dataDetails, textData;

      if (isItQuran) {
        dataDetails = await QuranService.getQuranByLang(language);
      } else {
        let bookNumber = UI.articleContainer.dataset.bookNumber;
        let hadithData = await HadithService.hadithData(bookNumber, language);
        dataDetails = hadithData.bookDetails;
        textData = dataDetails.hadiths;
      }

      UI.articleContainer.dir = direction;
      UI.quoteText.parentElement.dir = direction;

      activateElement(languagesList, li);
      generateQuoteFromJson(textData || dataDetails);
      translateArticleIfExists(dataDetails, articleTitleLang);
    });
  });
}

// function changeLanguageWhenClick(articleTitleLang) {
//   let languagesList = UI.languageSelector.querySelectorAll("li");

//   languagesList.forEach((li) => {
//     li.addEventListener("click", async () => {
//       language = li.dataset.language;
//       direction = li.dataset.direction;
//       articleTitleLang = language.startsWith("ara") ? "arabicname" : "name";

//       const quran = await QuranService.getQuranByLang(language);

//       UI.articleContainer.dir = direction;
//       UI.quoteText.parentElement.dir = direction;

//       activateElement(languagesList, li);
//       generateQuoteFromJson(quran.randomVerse);
//       translateArticleIfExists(quran);
//     });
//   });
// }

function activateElement([...elements], li) {
  elements.forEach((li) => li.classList.remove("active"));
  li.classList.add("active");
  li.parentElement.scrollTo(0, li.offsetTop);
}

let generateHandler = null;
let autoGenerateHandler = null;

// function generateQuoteFromJson(verses) {
//   generate(verses);

//   if (generateHandler && autoGenerateHandler) {
//     UI.generateBtn.removeEventListener("click", generateHandler);
//     UI.autoGenerateBtn.removeEventListener("click", autoGenerateHandler);
//   }

//   generateHandler = (_) => generate(verses);
//   UI.generateBtn.addEventListener("click", generateHandler);

//   autoGenerateHandler = (_) =>
//     autoGenerateQuote(verses);
//   UI.autoGenerateBtn.addEventListener("click", autoGenerateHandler);
// }

// let intervalId;
// let isGenerating = false;
// let shrinkingBar = document.querySelector(".shrinking-bar span");

// function autoGenerateQuote(chaptersInfo, verses, language) {
//   UI.pausePlayIcon.classList.toggle("pause-play");

//   if (isGenerating) {
//     clearInterval(intervalId);
//     shrinkingBar.style.width = "100%";
//     isGenerating = false;
//     return;
//   }

//   generate(chaptersInfo, verses, language);
//   shrinkingBar.style.width = 0;

//   intervalId = setInterval(() => {
//     generate(chaptersInfo, verses, language);
//     if (shrinkingBar.clientWidth === 0) {
//       shrinkingBar.style.width = "100%";
//     } else shrinkingBar.style.width = 0;
//   }, 5000);

//   isGenerating = true;
// }

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

// function generate(verses) {
//   let randomAyahDetails = QuranService.getRandomQuote(
//     chaptersInfo,
//     verses,
//     language
//   );
//   UI.quoteText.innerHTML = verses[1];
//   UI.quoteDetails.innerHTML = `${verses.ayah} ${verses[2]} ${verses.surah} ${verses[3]}`;
// }

// for hadith

async function translateArticleIfExists(data, articleTitleLang) {
  let articleChildren = UI.articleContainer.children;
  if (!articleChildren.length) return;

  if (isItQuran) {
    let chapterNum = +UI.articleContainer.dataset.chapterNum;
    let chapterName = data.chaptersInfo[chapterNum - 1][articleTitleLang];
    createArticle([chapterName, +chapterNum, data.chaptersInfo, data.quran]);
  } else {
    createTextBook([
      data.bookName,
      data.bookNumber,
      data.sections,
    ]);
  }

}

// async function translateArticleIfExists(quran, chaptersInfo, articleTitleLang) {
//   let articleChildren = UI.articleContainer.children;
//   if (articleChildren.length) {
//     let chapterNum = +UI.articleContainer.dataset.chapterNum;
//     let chapterName = chaptersInfo[chapterNum - 1][articleTitleLang];
//     createArticle([chapterName, +chapterNum, chaptersInfo, quran]);
//   }
// }

function createElements(...elementsName) {
  let elements = {};

  elementsName.forEach((element) => {
    element = element.split("=");
    elements[element[0]] = document.createElement(element[element.length - 1]);
  });

  return elements;
}
