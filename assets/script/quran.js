import { fetchUrl } from "../script/utils.js";

const quranUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions.min.json";
const quranInfoUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/info.min.json";

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
  language = language.replace("-","_");

  const quranInfo = await fetchUrl(quranInfoUrl);
  const chaptersInfo = quranInfo.chapters;
  const jsonData = await filteredLanguages();
  const dataLanguage = jsonData[language];
  const languageUrl = dataLanguage.linkmin;
  const quran = (await fetchUrl(languageUrl)).quran;
  return {
    quran,
    quranInfo,
    chaptersInfo,
    language,
    articleTitleLang: language.startsWith("ara") ? "arabicname" : "name",
  };
}

async function getSpecificPart(lang, part = "", partNum = "") {
  lang = lang.replace("_", "-");

  if (part) part = "/" + part;
  if (partNum) partNum = "/" + partNum;
  const link = `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/${lang}${part}${partNum}.min.json`;
  return await fetchUrl(link);
}

// Generate quote
function getRandomVerse({ quran: verses, chaptersInfo, language }) {
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
        verseText: verses[randomNum].text,
        verseNumber: verseObj.verse,
        surahName: surahDetails[title],
        ayah,
        surah,
      };
    }
  }
}

function formatChapterPages(chapterData) {
  let [chapterName, currentChapterNum, chaptersInfo, versesData] = chapterData;
  let versesInfo = chaptersInfo[+currentChapterNum - 1].verses;
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

async function showJuzOfChapter(lang, engName, btnNumber) {
  const quranData = await getQuranByLang(lang);
  const juzData = await getSpecificPart(lang, engName, btnNumber);

  const juz = juzData.juzs;
  const chaptersInfo = quranData.chaptersInfo;

  let juzPages = chaptersInfo.reduce((acc, info) => {
    if (info.verses[0].juz <= btnNumber) {
      acc.push(...info.verses.filter((verse) => verse.juz == btnNumber));
    }
    return acc;
  }, []);

  return getPageNumberAndText(juz, juzPages);
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
  getSpecificPart,
  showJuzOfChapter,
};
