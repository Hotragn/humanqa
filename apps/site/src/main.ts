import "./styles.css";

import { evidenceIcon, type EvidenceIconName } from "./icons";

for (const node of document.querySelectorAll<HTMLElement>("[data-icon]")) {
  const name = node.dataset["icon"] as EvidenceIconName | undefined;
  if (name) node.innerHTML = evidenceIcon(name, Number(node.dataset["size"] ?? "24"));
}

const navToggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const navPanel = document.querySelector<HTMLElement>("[data-nav-panel]");
navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  navPanel?.toggleAttribute("data-open", !expanded);
});

for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-nav-panel] a")) {
  link.addEventListener("click", () => {
    navToggle?.setAttribute("aria-expanded", "false");
    navPanel?.removeAttribute("data-open");
  });
}

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-copy]")) {
  button.addEventListener("click", async () => {
    const target = document.querySelector<HTMLElement>(button.dataset["copy"] ?? "");
    const value = target?.textContent?.trim();
    if (!target || !value) return;
    try {
      await navigator.clipboard.writeText(value);
      const original = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1600);
    } catch {
      button.textContent = "Select command";
      target.focus();
    }
  });
}

const search = document.querySelector<HTMLInputElement>("[data-doc-search]");
const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-doc-section]"));
const resultLabel = document.querySelector<HTMLElement>("[data-search-result]");

function filterDocumentation(): void {
  const query = search?.value.trim().toLocaleLowerCase() ?? "";
  let visible = 0;
  for (const section of sections) {
    const matches = !query || section.textContent?.toLocaleLowerCase().includes(query) === true;
    section.hidden = !matches;
    if (matches) visible += 1;
  }
  if (resultLabel) {
    resultLabel.textContent = query
      ? `${String(visible)} documentation ${visible === 1 ? "section" : "sections"} found`
      : "Search commands, reports, packs, and safety";
  }
}

search?.addEventListener("input", filterDocumentation);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) {
  document.documentElement.dataset["motion"] = "reduced";
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset["visible"] = "true";
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14 }
  );
  for (const element of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
    observer.observe(element);
  }
}

const year = document.querySelector<HTMLElement>("[data-year]");
if (year) year.textContent = new Date().getFullYear().toString();
