export const APP_VERSION = "0.9.1-beta.1";
export const RELEASE_CHANNEL = "beta";
export const RELEASE_CODENAME = "GLOBAL GRID";
export const RELEASE_DATE = null;
export const RELEASE_COMMIT = null;

export const RELEASE_URL =
  "https://github.com/Tao-2026/cyber-snake/releases/tag/v0.9.1-beta.1";

export const CHANGELOG_URL =
  "https://github.com/Tao-2026/cyber-snake/blob/main/CHANGELOG.md";

export const UPDATE_URL = RELEASE_DATE
  ? RELEASE_URL
  : CHANGELOG_URL;

const VERSION_COPY = Object.freeze({
  en: Object.freeze({
    channel:"BETA",
    codename:"GLOBAL GRID",
    updates:"View updates",
    updatesLabel:"View Cyber Snake version 0.9.1 beta 1 updates",
    title:"Cyber Snake v0.9.1-beta.1 — Global Grid"
  }),
  zh: Object.freeze({
    channel:"测试版",
    codename:"全球竞技场",
    updates:"查看更新",
    updatesLabel:"查看赛博贪吃蛇 0.9.1 测试版第 1 版更新",
    title:"赛博贪吃蛇 v0.9.1-beta.1 — 全球竞技场"
  })
});

export function getVersionPresentation(language = "en") {
  const copy = VERSION_COPY[language === "zh" ? "zh" : "en"];
  return Object.freeze({
    version:`v${APP_VERSION}`,
    channel:copy.channel,
    codename:copy.codename,
    updates:copy.updates,
    updatesLabel:copy.updatesLabel,
    title:copy.title,
    url:UPDATE_URL
  });
}
