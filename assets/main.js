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
  sidebar: document.querySelector("aside"),
  languageSelector: document.querySelector(".language-box"),
  fontSelector: document.querySelector(".fonts-box"),
  fontSizeInput: document.querySelector("aside .box input"),
  quoteText: document.querySelector(".quote-generator q"),
  chaptersList: document.getElementById("chapters-container"),
  heroSection: document.querySelector(".hero-section"),
  generateBtn: document.querySelector(".generator button"),
  autoGenerateBtn: document.querySelector(".generator .btn"),
  apiButtons: document.querySelectorAll(".api-btn button"),
  pausePlayIcon: document.querySelector(".btn span"),
  articleContainer : document.querySelector("article .container")
};

UI.burgerMenuBtn.addEventListener("click", () =>
  UI.sidebar.classList.toggle("toggle")
);

let allQuranLangPromis;
let quranInfoPromis;
let hadithPromis;

if (localStorage.api === "Hadith") {
  hadithPromis = fetchUrl(jsonUrls.hadith);
} else {
  allQuranLangPromis = fetchUrl(jsonUrls.quran);
  quranInfoPromis = fetchUrl(jsonUrls.quranInfo);
}

if (localStorage.lang !== undefined) {
  document.documentElement.lang = localStorage.lang;
  document.documentElement.dir = localStorage.dir;
  fetchUrl(localStorage.link);
}

async function fetchUrl(url) {
  let response = await fetch(url);
  let jsonData = await response.json();
  return jsonData;
}

async function excludeLatinLanguage() {
  const jsonData = await allQuranLangPromis;
  let filteredData = {};
  for (let key in jsonData) {
    if (/_lad?/i.test(key)) continue;
    filteredData[key] = jsonData[key];
  }
  createList(filteredData);
}
excludeLatinLanguage();

async function getQuranByLang(lang = "ara_quranwarsh") {
  let jsonData = await allQuranLangPromis;
  let languageUrl = jsonData[lang].linkmin;
  let quranJsonData = await fetchUrl(languageUrl);
  return quranJsonData.quran;
}

let quran = getQuranByLang();

async function generateQuoteFromJson() {
  let verses = await quran;
  let chaptersInfo = (await quranInfoPromis).chapters;
  console.log( await chaptersInfo)
  UI.generateBtn.addEventListener("click", () =>
    generateQuote(chaptersInfo, verses)
  );

  UI.autoGenerateBtn.addEventListener("click", () => {
    UI.pausePlayIcon.classList.toggle("pause-play");
    autoGenerateQuote(chaptersInfo, verses);
  });

  UI.chaptersList.innerHTML = "";
  createChapterBox(chaptersInfo);
  generateQuote(chaptersInfo, verses);
}
generateQuoteFromJson();

async function showChapterText() {
  const chaptersInfo = (await quranInfoPromis).chapters;
  const versesData = await quran;

  UI.chaptersList.addEventListener("click", (e) => {
    const button = e.target.closest(".chapter");
    if (!button) return;
    let currentChapterNum = +button.dataset.number;
    let chapterName = chaptersInfo[currentChapterNum - 1].arabicname;
    let versesInfo = chaptersInfo[currentChapterNum - 1].verses;
    let chapterData = getChapterData(versesData, currentChapterNum);
    let a = getPageText(chapterData, versesInfo, chapterName);
    createArticle(a,versesInfo[0].page,chapterName);
  });
}
showChapterText();

function getChapterData(versesData, chapterNum) {
  return versesData.filter((verseData) => {
    return chapterNum === verseData.chapter;
  });
}

function getPageText(chapterData, versesInfo, chapterName) {
  let pageCounter,pages,textData;
  pageCounter = versesInfo[0].page;
  pages = {};
  textData = []

  versesInfo.forEach((verse, ind) => {
    if (verse.page > pageCounter ) {
      pages[pageCounter] = textData;
      pageCounter = verse.page;
      textData = []
      }
    textData.push(chapterData[ind]);
  });

  pages[pageCounter] = textData;
  return pages;
}

function createArticle(pagesData,firstPage,chapterName) {
  UI.articleContainer.innerHTML = "";
  for (let ind in pagesData) {
    let elements = createElements("page=div","titleBox=div","title=h2","p","pageText=p","pageNumber=span");
    if (firstPage === +ind) {
      elements.titleBox.className = "title-box"
      elements.title.innerHTML = chapterName
      elements.p.innerHTML = "بِسْمِ اِ۬للَّهِ اِ۬لرَّحْمَٰنِ اِ۬لرَّحِيمِ";
      elements.titleBox.append(elements.title,elements.p)
      elements.page.append(elements.titleBox)
    }
    elements.page.className = "page";
    elements.page.append(elements.pageText)
    console.log(ind,pagesData[ind])

    pagesData[ind].forEach(ayahData => {
      let span = document.createElement("span");
      let img = document.createElement("img");
      img.src = "./assets/images/icons/verseIcon.svg"
      span.innerHTML = ayahData.text;
      span.append(img)
      elements.pageText.append(span);
    })

    elements.pageNumber.classList.add("page-number");
    elements.pageNumber.innerHTML = ind;
    elements.page.append(elements.pageNumber)
    UI.articleContainer.append(elements.page)
  }
  console.log(UI.articleContainer)
}
function createSurahPage() {
  elements.title.innerHTML = chapterName;
  elements.surahText.append(elements.title);
  let elements = createElements(
    "surahText=div",
    "title=h2",
    "text=p",
    "pageNumber=span"
  );

  elements.pageNumber.innerHTML = pageCounter;
  elements.surahText.append(elements.pageNumber);

  elements.text.append(chapterData[ind].text);
  elements.surahText.append(elements.text);

  elements.pageNumber.innerHTML = pageCounter;
  elements.surahText.append(elements.pageNumber);
}

function createList(obj) {
  for (let key in obj) {
    let elements = createElements("li", "span");
    elements.li.innerHTML = obj[key].language;
    elements.li.dataset.link = obj[key].linkmin;
    elements.span.innerHTML = `   (${obj[key].author})`;
    elements.li.append(elements.span);
    UI.languageSelector.append(elements.li);
  }
}

function createChapterBox(allChapters) {
  console.log(allChapters);
  // let surahs = []
  allChapters.forEach((chapter, ind) => {
    let elements = createElements(
      "chapterBox=div",
      "div",
      "span",
      "spanNum=span",
      "img",
      "h2"
    );
    elements.chapterBox.className = "chapter";
    elements.chapterBox.dataset.number = ind + 1;
    elements.spanNum.innerHTML = ind + 1;
    elements.img.src = "./assets/images/icons/aya-num.svg";
    elements.h2.innerHTML = chapter.arabicname;
    elements.span.innerHTML = chapter.verses.length + " اية";
    elements.div.append(elements.spanNum, elements.img);
    elements.chapterBox.append(elements.div, elements.h2, elements.span);
    UI.chaptersList.append(elements.chapterBox);
    // surahs.push(elements.chapterBox)
  });
  // return surahs;
}

function generateQuote(chaptersInfo, verses) {
  console.log(chaptersInfo, verses);
  let randomNum = parseInt(Math.random() * verses.length);
  let span = document.querySelector(".quote span");

  for (let surahDetails of chaptersInfo) {
    if (surahDetails.chapter === verses[randomNum].chapter) {
      for (let verseObj of surahDetails.verses) {
        if (verses[randomNum].verse === verseObj.verse) {
          span.innerHTML = ` الاية ${verseObj.verse} من ${surahDetails.arabicname} `;
        }
      }
    }
  }
  UI.quoteText.innerHTML = verses[randomNum].text;
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
console.log("kdslfls".split("="));
let isGenerating = false;
let intervalId;
let shrinkingBar = document.querySelector(".shrinking-bar span");
function autoGenerateQuote(quranChapters, verses) {
  if (isGenerating) {
    clearInterval(intervalId);
    shrinkingBar.style.width = "100%";
    isGenerating = false;
    return;
  }

  generateQuote(quranChapters, verses);
  shrinkingBar.style.width = 0;

  intervalId = setInterval(() => {
    generateQuote(quranChapters, verses);
    if (shrinkingBar.clientWidth === 0) {
      shrinkingBar.style.width = "100%";
    } else {
      shrinkingBar.style.width = 0;
    }
  }, 5000);
  isGenerating = true;
}
