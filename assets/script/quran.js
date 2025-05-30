import { fetchUrl } from "../script/utils.js";

const quranUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.min.json";
const quranInfoUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/info.json";

// Return all languages without latin
const filteredLanguages = async () => {
  const jsonData = await fetchUrl(quranUrl);
  let filteredData = {};
  for (let key in jsonData) {
    if (/_lad?/i.test(key)) continue;
    filteredData[key] = jsonData[key];
  }
  return filteredData;
};

// return quran by language and information about quran
async function getQuranByLang(language) {
  console.log(language)
  const chaptersInfo = (await fetchUrl(quranInfoUrl)).chapters;

  const jsonData = await filteredLanguages();
  const languageUrl = jsonData[language].linkmin;
  const quran = (await fetchUrl(languageUrl)).quran;
  return {
    quran,
    chaptersInfo,
    language
  };
}

// Generate quote
function getRandomVerse({quran:verses, chaptersInfo, language}) {
  let randomNum = parseInt(Math.random() * verses.length);
  let title, ayah, surah;
  for (let surahDetails of chaptersInfo) {
    if (surahDetails.chapter !== verses[randomNum].chapter) continue;
    for (let verseObj of surahDetails.verses) {
      if (verses[randomNum].verse !== verseObj.verse) continue;

      title = "name";
      ayah = "Ayah";
      surah = "from surah";

      if (language.startsWith("ara")) {
        title = "arabicname";
        ayah = "الاية";
        surah = "من";
      }

      return {
        verseText : verses[randomNum].text,
        verseNumber : verseObj.verse,
        surahName : surahDetails[title],
        ayah,
        surah,
      };
    }
  }
}

function formatChapterPages(chapterData) {
  let [chapterName, currentChapterNum, chaptersInfo, versesData] = chapterData;
  let versesInfo = chaptersInfo[currentChapterNum - 1].verses;
  let chapterDetails = getChapterData(versesData, +currentChapterNum);
  let pages = getPageNumberAndText(chapterDetails, versesInfo);

  let data = {
    pages: pages,
    chapterName: chapterName,
    chapterNum: currentChapterNum,
    basmala: versesData[0].text,
  };
  return data;
}

function getChapterData(versesData, chapterNum) {
  return versesData.filter((verseData) => {
    return chapterNum === verseData.chapter;
  });
}

function getPageNumberAndText(chapterDetails, versesInfo) {
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
    textData.push(chapterDetails[ind]);
  });

  pages[pageCounter] = textData;
  return pages;
}

export const QuranService = {
  filteredLanguages,
  getQuranByLang,
  getRandomVerse,
  formatChapterPages,
};
