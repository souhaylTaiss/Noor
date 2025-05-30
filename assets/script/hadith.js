import { fetchUrl } from "../script/utils.js";
const hadithUrl =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.min.json";

async function hadithData(bookNumber, languageNumber) {
  let data = await fetchUrl(hadithUrl);

   let bookDetails = await getBookDetails(data, bookNumber, languageNumber);
   return {
    bookDetails,
    get hadithBooks() {
      return getHadithBooks(data)
    },
    get languagesOfBook() {
      return getLanguagesOfBook(data,bookNumber)
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

function getLanguagesOfBook(data, bookNum = 1) {
  let dataArr = Object.values(data);
  let languages = dataArr[bookNum - 1].collection;
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

async function getBookDetails(data, bookNumber = 1, languageNum = 1) {
  let dataArr = Object.values(data);
  let booklink = dataArr[bookNumber - 1].collection[languageNum - 1].linkmin;
  let bookDetails = await fetchUrl(booklink);

  /*
    basmala
    :
    "بِسْمِ اِ۬للَّهِ اِ۬لرَّحْمَٰنِ اِ۬لرَّحِيمِ"
    chapterName
    :
    "سُوْرَةُ الْفَاتِحَةِ"
    chapterNum
    :
    1
    pages
    :
    {1: Array(7)}
*/

  // let data = {
    //   chapterName: chapterName,
    //   chapterNum: currentChapterNum,
    //   basmala: versesData[0].text,
    //   pages: pages,
  // };

  /*
   pages = {
      1 : {
      title : bookname,
      content : {
        1 : [{},{}],
        2 : [{},{}]
       }
      }
   }
  */

  let hadiths = bookDetails.hadiths;
  let section = bookDetails.metadata.sections;
  let sectionsDetails = bookDetails.metadata.section_details;
  let sections = {}
  let counter = 1;

  for (let ind in section) {
    if (ind == 0) continue;

    let pages = {};
    let start = sectionsDetails[ind].hadithnumber_first;
    let end = sectionsDetails[ind].hadithnumber_last;

    sections[ind] = {}
    sections[ind].sectionTitle = section[ind];

    let arr = [];
    for (let i = start; i < end; i++) {
      if (arr.length === 3) {
        pages[counter] = arr;
        arr = [];
        counter++
      }
      arr.push(hadiths[i - 1]);
    }
    sections[ind].content = pages;
  }


  return {
    bookName: bookDetails.metadata.name,
    bookNumber,
    sections,
    hadiths
  };
}

function getRandomHadith(hadiths) {
  let randomNum = parseInt(Math.random() * hadiths.length);
  let hadith = hadiths[randomNum].text;
  let hadithNumber = hadiths[randomNum].hadithnumber;
  return {hadith, hadithNumber};
}

export const HadithService = {
  hadithData,
  // getHadithBooks,
  // getLanguagesOfBook,
  // getBookDetails,
  getRandomHadith
};
