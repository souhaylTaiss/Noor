import { fetchUrl } from "../script/utils.js";
const hadithUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.min.json";

async function hadithData(bookNumber = 0, lang) {
  bookNumber--;
  let data = await fetchUrl(hadithUrl);
  let bookDetails = await getBookDetails(bookNumber, lang);
  let dataArr = Object.values(data);

   return {
    bookDetails,
    dataArr,
    get hadithBooks() {
      return getHadithBooks(data);
    },
    get languagesOfBook() {
      return getLanguagesOfBook(dataArr,bookNumber);
    },
  }
}

function getHadithBooks(data) {
  let books = [];

  for (let ind in data) {
    books.push({
      name: data[ind].name,
      link: data[ind].collection[0].linkmin,
    });
  }

  return books;
}

function getLanguagesOfBook(data, bookNum) {
  let languages = data[bookNum].collection;
  let filteredLanguages = [];
  languages.forEach((details) => {
    filteredLanguages.push({
      language: details.language,
      direction: details.direction,
      details: details.linkmin,
      name: details.name,
    });
  });

  return filteredLanguages;
}

async function getBookDetails(bookNumber, language ) {
  let bookDetails = await getSpecificPart(language);
  let isArabicLang = language.toLowerCase().startsWith("ara");

  let hadiths = bookDetails.hadiths;
  let section = bookDetails.metadata.sections;
  let sectionsDetails = bookDetails.metadata.section_details;
  let sections = {};
  let counter = 1;

  for (let ind in section) {
    if (ind == 0) continue;
    let pages = {};
    let start = sectionsDetails[ind].hadithnumber_first;
    let end = sectionsDetails[ind].hadithnumber_last + 1;

    sections[ind] = {};
    sections[ind].sectionTitle = section[ind];

    let arr = [];
    for (let i = start; i < end; i++) {
      if (arr.length === 3) {
        pages[counter] = arr;
        arr = [];
        counter++;
      }
      arr.push(hadiths[i - 1]);
    }
    sections[ind].content = pages;
  }

  return {
    bookName: bookDetails.metadata.name,
    bookNumber,
    sections,
    hadiths,
    isArabicLang
  };
}

function getRandomHadith(hadiths) {
  let randomNum = parseInt(Math.random() * hadiths.length);
  let hadith = hadiths[randomNum].text;
  let hadithNumber = hadiths[randomNum].hadithnumber;
  return {hadith, hadithNumber};
}


async function getSpecificPart(language, part, number) {
  language = "/" + language;
  part = part? "/" + part: "";
  number = number? "/" + number: "";
  const link = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions${language}${part}${number}.min.json`;
  return await fetchUrl(link);
}

export const HadithService = {
  hadithData,
  getRandomHadith,
  getSpecificPart
};
