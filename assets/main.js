// Script
const quranUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.min.json";
const hadithUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.min.json";
const fontUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/fonts.json";
// const tafsirUrl =
//   "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-muyassar/11/empty_ayahs.json";

const menu = document.querySelector(".menu");
const sideBar = document.querySelector("aside");
const languageBox = document.querySelector(".language-box");
const fontsBox = document.querySelector(".fonts-box");
const fontSizeValue = document.querySelector("aside .box input");
const quoteBox = document.querySelector(".quote-generator q");
const sowarcontainer = document.querySelector(".sowar");
const heroSection = document.querySelector(".hero-section");
const generatorBtn = document.querySelector(".generator button");
const autoGenerateBtn = document.querySelector(".generator .btn");
const quranHadithBtns = document.querySelectorAll(".api-btn button");

menu.addEventListener("click", () => sideBar.classList.toggle("toggle"));

// let observe = new IntersectionObserver(([entry]) => {
//   if (!entry.isIntersecting) {
//     heroSection.classList.add("sticky");
//     console.log(entry)
//   }
//   window.addEventListener("scroll",() => {
//     if(window.scrollY === 0){
//       heroSection.classList.remove("sticky")
//     }
//   })
//   threshold: 2;
// })
// observe.observe(heroSection)

let quran, hadith;

if (localStorage.api === "Hadith") {
  hadith = fetchUrl(hadithUrl);
} else {
  quran = fetchUrl(quranUrl);
}
if (localStorage.lang !== undefined) {
  document.documentElement.lang = localStorage.lang;
  document.documentElement.dir = localStorage.dir;
  fetchUrl(localStorage.link);
}

async function fetchUrl(url) {
  let data = await fetch(url);
  let finalData = await data.json();

  // Remove Latin language
  let finalObj = {};
  for (let key in finalData) {
    if (/_lad?/i.test(key)) continue;
    finalObj[key] = finalData[key];
  }
  createList(finalObj);

  let langLink = finalData["ara_quranwarsh"].linkmin;
  let promise = await fetch(langLink);
  let content = await promise.json();
  let info = await fetch(
    "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/info.json"
  );
  let quranInfo = await info.json();

  return [content.quran, quranInfo];
}

function createList(obj) {
  for (let key in obj) {
    let li = document.createElement("li");
    let span = document.createElement("span");
    li.innerHTML = obj[key].language;
    li.dataset.link = obj[key].linkmin;
    span.innerHTML = `   (${obj[key].author})`;
    li.append(span);
    languageBox.append(li);
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
    sowarcontainer.append(souraBox);
    sowarcontainer.appendChild(souraBox);
  }
}

/*
api => quran or hadith or Undefined
language => arabic or en or ...
+direction => rtl or ltr
font => serif or ...

*/

function generateQuote(quranChapters, quranVerses) {
  let randomNum = parseInt(Math.random() * quranVerses.length);
  let span = document.querySelector(".quote span");

  for (let obj of quranChapters) {
    if (obj.chapter === quranVerses[randomNum].chapter) {
      for (let verseObj of obj.verses) {
        if (quranVerses[randomNum].verse === verseObj.verse) {
          span.innerHTML = ` الاية ${verseObj.verse} من ${obj.arabicname} `;
        }
      }
    }
  }
  quoteBox.innerHTML = quranVerses[randomNum].text;
}

let isGenerating = false;
let intervalId;
let shrinkingBar = document.querySelector(".shrinking-bar span");
function autoGenerateQuote(quranChapters, quranVerses) {
  if (isGenerating) {
    clearInterval(intervalId);
    shrinkingBar.style.width = "100%";
    isGenerating = false;
    return;
  }

  generateQuote(quranChapters, quranVerses);
  shrinkingBar.style.width = 0;

  intervalId = setInterval(() => {
    generateQuote(quranChapters, quranVerses);
    if (shrinkingBar.clientWidth === 0) {
      shrinkingBar.style.width = "100%";
    } else {
      shrinkingBar.style.width = 0;
    }
  }, 5000);
  isGenerating = true;
}

function getChapterPages(chapter, pagesInfo) {
  function getStartPage() {
    for (let ind in pagesInfo) {
      let prePage = pagesInfo[ind - 1];
      let page = pagesInfo[ind];

      if (chapter > 114 || chapter < 1) return "no chapter";
      if (chapter >= 112) return 604;

      if (page.start.chapter === chapter) {
        if (page.start.verse === 1) {
          return page.page;
        } else {
          return prePage.page;
        }
      } else if (
        page.start.chapter > chapter &&
        prePage.start.chapter < chapter
      ) {
        return prePage.page;
      }
    }
  }
  let startNum = getStartPage();
  function getEndPage() {
    // console.log(start, pagesInfo.length);
    if (chapter > 114 || chapter < 1) return "no chapter";
    if (chapter >= 112) {
      return 604;
    }
    for (let ind = startNum; ind < pagesInfo.length; ind++) {
      let page = pagesInfo[ind];

      if (page.end.chapter !== chapter) {
        return pagesInfo[ind - 1].page;
      }
    }
  }
  let endNum = getEndPage();
  startNum = startNum - 1;
  return { startNum, endNum };
}

quran
  .then((arr) => {
    let quranVerses = arr[0];
    console.log(quranVerses);
    let quranInfo = arr[1];
    let pausePlayIcon = document.querySelector(".btn span");

    generatorBtn.addEventListener("click", () =>
      generateQuote(quranInfo.chapters, quranVerses)
    );
    autoGenerateBtn.addEventListener("click", () => {
      pausePlayIcon.classList.toggle("pause-play");
      autoGenerateQuote(quranInfo.chapters, quranVerses);
    });
    sowarcontainer.innerHTML = "";
    createSoraBox(quranInfo.chapters);

    generateQuote(quranInfo.chapters, quranVerses);
    return { quran: arr[0], quranInfo: arr[1] };
  })
  .then((obj) => {
    let quranVerses = obj.quran;
    let pagesInfo = obj.quranInfo.pages.references;
    let chapters = document.querySelectorAll(".sowar .soura");

    console.log(obj.quranInfo);
    console.log(obj.quran);

    chapters.forEach((ele) => {
      ele.addEventListener("click", () => {
        let chapterNum = parseInt(ele.dataset.number);

        // getChapter(quranVerses, pagesInfo, ele,obj);
        let range = getChapterPages(chapterNum, pagesInfo);
        let urls = [];
        for (let i = range.startNum; i < range.endNum; i++) {
          urls.push(
            `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranwarsh/pages/${
              i + 1
            }.json`
          );
        }
        async function* waitLoad(urls) {
          for (const url of urls) {
            const data = await fetch(url).then((res) => res.json());
            yield data;
          }
        }
        (async () => {
          for await (const jsonData of waitLoad(urls)) {
            console.log("✅ Loaded:", jsonData);
          }
        })();
      });
    });
  });

function getChapter(quranVerses, pagesInfo, ele, obj) {
  let chapterNum = parseInt(ele.dataset.number);
  let versesLength = obj.quranInfo.chapters[chapterNum - 1].verses.length;
  let range = getChapterPages(chapterNum, pagesInfo);
  let chapter = quranVerses.filter((v) => v.chapter === chapterNum);
  console.log("what i get from father", versesLength);

  let currentPageIndex = 0;
  let arr = [];
  function getPageStartEnd() {
    if (range.startNum === range.endNum) {
      for (let i = 0; i < chapter.length; i++) {
        if (chapter[i].chapter === chapterNum) {
          console.log(chapter[i].text);
          if (i + 1 == chapter.length) {
            console.log("#####", range.startNum, "#####");
          }
        }
      }
    } else {
      arr = pagesInfo.slice(range.startNum, range.endNum).map((page) => {
        let obj = {
          pageNumber: page.page,
          start: page.start.verse,
          end: page.end.verse,
        };
        if (page.end.verse != versesLength) console.log("nooooooooooo");
        return obj;
      });
    }
  }
  getPageStartEnd();
  // for (let i = 0; i < chapter.length; i++) {
  //   if (currentPageIndex >= arr.length) break;
  //   console.log(chapter[i]);
  //   let verseNumber = i + 1;
  //   if (verseNumber == arr[currentPageIndex].end) {
  //     console.log("#####", arr[currentPageIndex].pageNumber, "#####");
  //     currentPageIndex++;
  //   }
  //   if (verseNumber === undefined) {
  //     console.log("#kjh####", arr[currentPageIndex].page, "#####");
  //   }
  // }
  console.log(arr);
  arr.forEach((page) => {
    // let end = false;
    chapter.forEach((verse, ind) => {
      console.log("versee", verse.verse, "page", page.start);
      if (verse.verse === page.end) {
        console.log("#####", page.pageNumber, "######");
      }
      // if (ind === chapter.length - 1 ) {
      //   end = true;
      // }
    });
    // if (end) {
    //   console.log("what array gave",arr[arr.length - 1].end)
    // }
  });
}
