// ==================== Article / Content Rendering ====================
import { UI, createElements } from "./elements.js";
import { appState } from "./state.js";
import { dataServer } from "./data.js";
import { showLoading, hideLoading } from "./loading.js";
import { QuranService } from "./quran.js";
import { HadithService } from "./hadith.js";

const body = document.body;
const scrollToTop = () => window.scrollTo(0, 0);

export function createArticle(chapterData) {
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
      "pageNumber=span",
      "bookmark=div",
    );

    if (firstPage === ind) {
      UI.articleContainer.dataset.number = chapterNum;
      UI.articleContainer.dataset.key = "chapters";
      elements.titleBox.className = "title-box";
      elements.title.innerHTML = chapterName;
      elements.p.innerHTML = basmala;
      elements.titleBox.append(elements.title, elements.p);
      elements.page.append(elements.titleBox);
    }

    elements.page.className = "page";
    elements.page.append(elements.pageText);
    addTextToPage(pages[ind], elements);

    elements.bookmark.classList.add("bookmark");
    elements.bookmark.innerHTML = `<img src="./assets/images/icons/bookmark.svg" alt="bookmark" />`;
    elements.pageNumber.classList.add("page-number");
    elements.pageNumber.innerHTML = ind;
    elements.page.append(elements.pageNumber, elements.bookmark);
    UI.articleContainer.append(elements.page);
  }
}

export function createTextBook(sections, translations) {
  let siteLang = appState.siteLang;
  let title = createElements("h2").h2;
  UI.articleContainer.innerHTML = "";
  UI.articleContainer.dataset.number = appState.bookNumber;
  title.innerHTML =
    translations[siteLang].hadith.booksName[appState.bookNumber - 1];

  for (let ind in sections) {
    let subTitle = createElements("h3").h3;
    subTitle.innerHTML =
      translations[siteLang].hadith.bookSections[appState.bookNumber - 1][
        ind - 1
      ] || "";

    let isItNewSection = true;
    for (let i in sections[ind].content) {
      let elements = createElements(
        "page=div",
        "titleBox=div",
        "subTitle=h3",
        "textBox=div",
        "pageNumber=span",
        "bookmark=div",
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
        let { text, reference } = createElements("text=p", "reference=p");
        text.innerHTML = hadith.text;
        let word = appState.hadithLang[appState.bookNumber - 1].startsWith("ar")
          ? "حديث"
          : "Hadith";
        reference.innerHTML = `${word} ${hadith.reference.hadith}`;
        text.append(reference);
        text.style.marginBottom = "20px";
        elements.textBox.append(text);
      });

      elements.bookmark.classList.add("bookmark");
      elements.bookmark.innerHTML = `<img src="./assets/images/icons/bookmark.svg" alt="bookmark" />`;
      elements.page.className = "page";
      elements.pageNumber.classList.add("page-number");
      elements.pageNumber.innerHTML = i;
      elements.page.append(elements.textBox, elements.pageNumber, elements.bookmark);
      UI.articleContainer.append(elements.page);
    }
    if (ind == 3) break;
  }
}

export function addTextToPage(pageData, elements, chaptersInfo, preChapter) {
  pageData.forEach((ayahData) => {
    let title = "";

    if (ayahData.chapter !== preChapter && preChapter !== undefined) {
      title = createElements("title=h2").title;
      title.style.textAlign = "center";
      title.style.margin = "20px auto -5px";
      title.innerHTML = chaptersInfo[preChapter].arabicname;
      preChapter = ayahData.chapter;
    }

    let versesNumber = document.createElement("span");
    versesNumber.classList.add("verse-number");
    versesNumber.innerHTML = ayahData.verse;
    elements.pageText.append(title, ayahData.text, versesNumber);
  });

  return preChapter;
}

export async function getQuranPart(btn, key) {
  let lang = appState.language.startsWith("ar") ? "arabicName" : "latinName";

  showLoading(body);
  scrollToTop();
  UI.main.classList.add("hidden");
  UI.leftSidebar.classList.remove("active");

  let btnNumber = btn.dataset.number;
  let partName = btn.dataset[lang];
  UI.articleContainer.innerHTML = "";

  let quranData = await dataServer.quranData();
  let chaptersInfo = quranData.chaptersInfo;
  let pages;

  if (key == "juzs") {
    pages = await QuranService.showJuzOfChapter(
      appState.language,
      key,
      btnNumber,
    );
  } else if (key == "pages") {
    pages = await QuranService.getSpecificPart(
      appState.language,
      key,
      btnNumber,
    );
  } else {
    let verse = await QuranService.getSpecificPart(
      appState.language,
      key,
      btnNumber,
    );
    pages = {};
    pages[partName] = [verse];
  }

  let pagesArr = Object.entries(pages);
  let firstPage = pagesArr[0][0];
  let preChapter = pagesArr[0][1][0].chapter;

  pagesArr.forEach((page) => {
    let ind = page[0];
    let isFirstPage = firstPage === ind;
    let elements = createElements(
      "page=div",
      "titleBox=div",
      "title=h2",
      "subTitle=h3",
      "pageText=p",
      "pageNumber=span",
    );

    if (isFirstPage) {
      UI.articleContainer.dataset.number = btnNumber;
      UI.articleContainer.dataset.key = key;
      elements.titleBox.className = "title-box";
      elements.title.innerHTML = btn.dataset[lang];
      elements.titleBox.append(elements.title);
      if (!(key == "pages" || btn.dataset.latinName.startsWith("Verse"))) {
        elements.page.append(elements.titleBox);
      }
    }

    if (page[1][0].chapter !== preChapter || isFirstPage) {
      preChapter = page[1][0].chapter;
      let titleLang = appState.language.startsWith("ar")
        ? "arabicname"
        : "name";
      elements.subTitle.innerHTML = chaptersInfo[preChapter - 1][titleLang];
      elements.page.append(elements.subTitle);
    }

    elements.page.className = "page";
    elements.page.append(elements.pageText);
    preChapter = addTextToPage(pages[ind], elements, chaptersInfo, preChapter);

    elements.pageNumber.classList.add("page-number");
    elements.pageNumber.innerHTML = isNaN(+ind) ? btnNumber : ind;
    elements.page.append(elements.pageNumber);
    UI.articleContainer.append(elements.page);
  });

  hideLoading(body);
}

export async function showHadithPart(lang, li, bookNumber) {
  UI.articleContainer.innerHTML = "";
  let sectionNumber = li.dataset.number;

  showLoading(body);
  scrollToTop();
  UI.main.classList.add("hidden");
  UI.leftSidebar.classList.remove("active");
  UI.articleContainer.dataset.number = bookNumber;
  UI.articleContainer.dataset.key = "sections";

  let bookDetails = await HadithService.getSpecificPart(
    lang,
    "sections",
    sectionNumber,
  );
  let hadiths = bookDetails.hadiths;

  let counter = 1;
  let pages = {};
  let arr = [];

  for (let i = 0; i < hadiths.length; i++) {
    if (arr.length === 3) {
      pages[counter] = arr;
      arr = [];
      counter++;
    }
    arr.push(hadiths[i]);
  }

  let title = createElements("h2").h2;
  title.innerHTML =
    appState.siteLang == "ar" || lang.startsWith("ara")
      ? li.dataset.arabicName
      : li.dataset.latinName;

  for (let i in pages) {
    let elements = createElements(
      "page=div",
      "titleBox=div",
      "subTitle=h3",
      "textBox=div",
      "pageNumber=span",
    );

    if (i === "1") {
      elements.titleBox.append(title);
      elements.page.append(elements.titleBox);
    }

    pages[i].forEach((hadith) => {
      let { text, reference } = createElements("text=p", "reference=p");
      text.innerHTML = hadith.text;
      let word = lang.startsWith("ar") ? "حديث" : "Hadith";
      reference.innerHTML = `${word} ${hadith.reference.hadith}`;
      text.append(reference);
      elements.textBox.append(text);
    });

    elements.page.className = "page";
    elements.pageNumber.classList.add("page-number");
    elements.pageNumber.innerHTML = i;
    elements.page.append(elements.textBox, elements.pageNumber);
    UI.articleContainer.append(elements.page);
  }

  hideLoading(body);
}
