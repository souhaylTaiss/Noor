import { fetchUrl } from "../script/utils.js";

const fontsUrl = "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/fonts.json";

export async function getAllFonts() {
  return await fetchUrl(fontsUrl);
}

