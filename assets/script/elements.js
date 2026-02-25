// ==================== DOM Elements ====================

export const UI = {
  logo: document.querySelector(".logo"),
  home: document.querySelector(".home"),
  main: document.querySelector("main"),
  burgerMenuBtn: document.querySelector(".menu"),
  searchBtn: document.querySelector(".search-btn"),
  rightCloseBtn: document.querySelector("aside.settings .close-btn"),
  leftCloseBtn: document.querySelector("aside.book-details .close-btn"),
  siteLangAr: document.querySelector(".website-language-box li:first-child"),
  siteLangEn: document.querySelector(".website-language-box li:last-child"),
  rightSidebar: document.querySelector("aside.settings"),
  leftSidebar: document.querySelector("aside.book-details"),
  searchResultBox: document.querySelector(".details"),
  bookOptionContainer: document.querySelector(".book-detail-selectors"),
  languageSelector: document.querySelector(".language-box"),
  fontSelector: document.querySelector(".fonts-box"),
  fontSizeIncrease: document.querySelector("aside .box .increase"),
  fontSizeDecrease: document.querySelector("aside .box .reduce"),
  quranBtn: document.querySelector("[value='quran']"),
  hadithBtn: document.querySelector("[value='hadith']"),
  inputSearch: document.querySelector(".search-field input"),
  subInputSearch: document.querySelector(".search-field input:last-child"),
  quoteText: document.querySelector(".quote-generator p"),
  quoteDetails: document.querySelector(".quote span"),
  shrinkingBar: document.querySelector(".shrinking-bar"),
  chaptersList: document.getElementById("chapters-container"),
  heroSection: document.querySelector(".hero-section"),
  generateBtn: document.querySelector(".generator .btn:first-child"),
  autoGenerateBtn: document.querySelector(".generator .btn:last-child"),
  pausePlayIcon: document.querySelector(".btn span"),
  articleContainer: document.querySelector("article .container"),
  scrollTopBtn: document.querySelector(".scroll-top"),
  downloadBtn: document.querySelector("[value='download'"),
  navbar: document.querySelector("nav .container"),
  menuContainer: document.querySelector("nav .container ul:first-child"),
  subMenu: document.querySelector("nav .container ul ul"),

};

export function createElements(...elementsName) {
  let elements = {};
  elementsName.forEach((element) => {
    element = element.split("=");
    elements[element[0]] = document.createElement(element[element.length - 1]);
  });
  return elements;
}

export function activateElement([...elements], li) {
  elements.forEach((el) => el.classList.remove("active"));
  li.classList.add("active");
  li.parentElement.scrollTo(0, li.offsetTop);
}
