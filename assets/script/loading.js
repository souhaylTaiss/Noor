// ==================== Loading ====================
import { createElements } from "./elements.js";

export function showLoading(target) {
  const loadingEle = createElements("div").div;
  const loadingText = createElements("p").p;
  loadingText.innerHTML = "Loading...";
  loadingEle.className = "loading";
  loadingEle.innerHTML = `<div class="loading-ring"></div>`;
  target.style.position = "relative";
  loadingEle.append(loadingText);

  if (target.tagName === "BODY") {
    Object.assign(loadingEle.style, {
      backgroundColor: "white",
      height: "100vh",
      position: "fixed",
      zIndex: "19999",
    });
  }

  target.insertAdjacentElement("afterbegin", loadingEle);
}

export function hideLoading(target) {
  target.querySelector(".loading")?.remove();
}
