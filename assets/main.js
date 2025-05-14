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
  chaptersList: document.querySelector(".sowar"),
  heroSection: document.querySelector(".hero-section"),
  generateBtn: document.querySelector(".generator button"),
  autoGenerateBtn: document.querySelector(".generator .btn"),
  apiButtons: document.querySelectorAll(".api-btn button"),
  pausePlayIcon: document.querySelector(".btn span"),
};

UI.burgerMenuBtn.addEventListener("click", () =>
  UI.sidebar.classList.toggle("toggle")
);

let allQuranLang;
let quranInfo;
let hadith;

if (localStorage.api === "Hadith") {
  hadith = fetchUrl(jsonUrls.hadith);
} else {
  allQuranLang = fetchUrl(jsonUrls.quran);
  quranInfo = fetchUrl(jsonUrls.quranInfo);
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
  const jsonData = await allQuranLang;
  let filteredData = {};
  for (let key in jsonData) {
    if (/_lad?/i.test(key)) continue;
    filteredData[key] = jsonData[key];
  }
  createList(filteredData);
}
excludeLatinLanguage();

async function getQuranByLang(lang = "ara_quranwarsh") {
  let jsonData = await allQuranLang;
  let languageUrl = jsonData[lang].linkmin;
  let quranJsonData = await fetchUrl(languageUrl);
  return quranJsonData.quran;
}

let quran = getQuranByLang();

async function generateQuoteFromJson() {
  let verses = await quran;
  let chaptersInfo = (await quranInfo).chapters;

  UI.generateBtn.addEventListener("click", () =>
    generateQuote(chaptersInfo, verses)
  );

  UI.autoGenerateBtn.addEventListener("click", () => {
    UI.pausePlayIcon.classList.toggle("pause-play");
    autoGenerateQuote(chaptersInfo, verses);
  });

  UI.chaptersList.innerHTML = "";
  createSoraBox(chaptersInfo);
  generateQuote(chaptersInfo, verses);
}
generateQuoteFromJson();

async function createChapterList() {
  quranInfo = await quranInfo;
  let pagesInfo = quranInfo.pages.references;
  let chaptersBtns = document.querySelectorAll(".sowar .soura");

  chaptersBtns.forEach((button) => {
    button.addEventListener("click", () => {
      let currentChapterNum = +button.dataset.number;
      showChapterText(currentChapterNum, pagesInfo);
    });
  });
}
createChapterList();

function showChapterText(currentChapterNum,pagesInfo) {
  let chapterPageRange = getChapterPageRange(currentChapterNum, pagesInfo);
  let urls = createPageUrlsFromRange(chapterPageRange);

  (async () => {
    for await (const jsonData of waitJsonDataLoad(urls)) {
      let chapterPages = jsonData.pages;
      let filteredVerses = chapterPages.filter((page) => {
        return page.chapter === currentChapterNum;
      });
      console.log("this is filtered data", filteredVerses);
    }
  })();
}

function createPageUrlsFromRange(range) {
  let urls = [];
  const pagesUrl =
    "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranwarsh/pages/";

  for (let i = range.startNum; i < range.endNum + 1; i++) {
    urls.push(`${pagesUrl}${i}.json`);
  }
  return urls;
}

async function* waitJsonDataLoad(urls) {
  for (const url of urls) {
    const data = await fetchUrl(url);
    yield data;
  }
}
/*
Promise.all([quran, quranInfo])
  .then(([verses, quranInfo]) => {
    UI.generateBtn.addEventListener("click", () =>
      generateQuote(quranInfo.chapters, verses)
    );

    UI.autoGenerateBtn.addEventListener("click", () => {
      UI.pausePlayIcon.classList.toggle("pause-play");
      autoGenerateQuote(quranInfo.chapters, verses);
    });

    UI.chaptersList.innerHTML = "";
    createSoraBox(quranInfo.chapters);
    generateQuote(quranInfo.chapters, verses);

    return [verses, quranInfo];
  })
  .then(([verses, quranInfo]) => {
    let pagesInfo = quranInfo.pages.references;
    let chaptersBtns = document.querySelectorAll(".sowar .soura");

    chaptersBtns.forEach((button) => {
      button.addEventListener("click", () => {
        let currentChapterNum = parseInt(button.dataset.number);
        let chapterPageRange = getChapterPageRange(
          currentChapterNum,
          pagesInfo
        );
        let urls = [];
        const pagesUrl =
          "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranwarsh/pages/";

        for (
          let i = chapterPageRange.startNum;
          i < chapterPageRange.endNum + 1;
          i++
        ) {
          urls.push(`${pagesUrl}${i}.json`);
        }
        async function* waitLoad(urls) {
          for (const url of urls) {
            const data = await fetchUrl(url);
            yield data;
          }
        }
        console.log("this is range" ,chapterPageRange);
        (async () => {
          let i = chapterPageRange.startNum;
          for await (const jsonData of waitLoad(urls)) {
            let chapterPages = jsonData.pages;
            console.log(i,chapterPageRange.startNum)
            if (chapterPageRange.startNum === i) {
              let filteredChapter = chapterPages.filter((page) => {
                return page.chapter === currentChapterNum;
              });
              console.log(filteredChapter)
              // console.log(chapterNum);
            }
            console.log("page Number: ", i, jsonData);
            i++;
          }
          if (chapterPageRange.endNum + 1 === i)
            console.log("start and end page: ", i);
        })();
      });
    });
  });
*/

function createList(obj) {
  for (let key in obj) {
    let li = document.createElement("li");
    let span = document.createElement("span");
    li.innerHTML = obj[key].language;
    li.dataset.link = obj[key].linkmin;
    span.innerHTML = `   (${obj[key].author})`;
    li.append(span);
    UI.languageSelector.append(li);
  }
}

function createSoraBox(sowar) {
  for (let sora of sowar) {
    let souraBox = document.createElement("div");
    let div = document.createElement("div");
    let spanNum = document.createElement("span");
    let img = document.createElement("img");
    let h2 = document.createElement("h2");
    let span = document.createElement("span");
    souraBox.className = "soura";
    souraBox.dataset.number = sowar.indexOf(sora) + 1;
    spanNum.innerHTML = sowar.indexOf(sora) + 1;
    img.src = "./assets/images/icons/aya-num.svg";
    h2.innerHTML = sora.arabicname;
    span.innerHTML = sora.verses.length + " اية";
    div.append(spanNum, img);
    souraBox.append(div, h2, span);
    UI.chaptersList.append(souraBox);
    UI.chaptersList.appendChild(souraBox);
  }
}

function generateQuote(quranChapters, verses) {
  let randomNum = parseInt(Math.random() * verses.length);
  let span = document.querySelector(".quote span");

  for (let obj of quranChapters) {
    if (obj.chapter === verses[randomNum].chapter) {
      for (let verseObj of obj.verses) {
        if (verses[randomNum].verse === verseObj.verse) {
          span.innerHTML = ` الاية ${verseObj.verse} من ${obj.arabicname} `;
        }
      }
    }
  }
  UI.quoteText.innerHTML = verses[randomNum].text;
}

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

function getChapterPageRange(currentChapterNum, pagesInfo) {
  let maxChapterNum = 114;
  let minChapterNum = 1;
  let lastPage = 604;
  let lastChapter = 112;

  if (currentChapterNum > maxChapterNum || currentChapterNum < minChapterNum)
    return "no chapter";
  if (currentChapterNum >= lastChapter)
    return { startNum: lastPage, endNum: lastPage };

  let startNum = getStartPage(currentChapterNum, pagesInfo);
  let endNum = getEndPage(currentChapterNum, pagesInfo, startNum) - 1;
  return { startNum, endNum };
}

function getStartPage(currentChapterNum, pagesInfo) {
  for (let ind in pagesInfo) {
    let previousPage = pagesInfo[ind - 1];
    let pageDetail = pagesInfo[ind];
    if (pageDetail.start.chapter === currentChapterNum) {
      if (pageDetail.start.verse === 1) return pageDetail.page;
      return previousPage.page;
    }
    if (pageDetail.start.chapter > currentChapterNum) return previousPage.page;
  }
}

function getEndPage(currentChapterNum, pagesInfo, startNum) {
  return pagesInfo.slice(startNum).find((pageNum) => {
    return pageNum.start.chapter !== currentChapterNum;
  }).page;
}
