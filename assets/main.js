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
    let chapters = document.querySelectorAll(".sowar .soura");
    console.log(obj.quranInfo.pages)
    chapters.forEach((ele) => {
      ele.addEventListener("click", (e) => {
        let chapterNum = ele.dataset.number;
        for (let aya of getChapter(chapterNum)) {
          console.log(aya.text);
        }
      });
    });
    
    function getChapter(chapterNum) {
       let sora = obj.quran.filter((aya) => {
          let chapter = aya.chapter;
          if (chapter == chapterNum) {
            return aya;
          }
        });
        return sora;
    }
  });
