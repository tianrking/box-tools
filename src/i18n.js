export const LANGUAGES = {
  en: { label: "English", htmlLang: "en" },
  es: { label: "Español", htmlLang: "es" },
  zh: { label: "中文", htmlLang: "zh-CN" },
};

export function getLanguage(request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");
  return Object.hasOwn(LANGUAGES, lang) ? lang : "en";
}

export function localizeUrl(url, lang) {
  const next = new URL(url);
  if (lang === "en") {
    next.searchParams.delete("lang");
  } else {
    next.searchParams.set("lang", lang);
  }
  return next.toString();
}

export function preserveLanguageUrl(url, lang) {
  return localizeUrl(url, lang);
}

export function renderLanguageSwitch(request, currentLang) {
  const url = new URL(request.url);
  const links = Object.entries(LANGUAGES)
    .map(([lang, meta]) => {
      const href = localizeUrl(url, lang);
      const active = lang === currentLang ? ' class="active"' : "";
      return `<a href="${href}"${active}>${meta.label}</a>`;
    })
    .join("");

  return `<div class="language-switch" aria-label="Language switcher">${links}</div>`;
}
