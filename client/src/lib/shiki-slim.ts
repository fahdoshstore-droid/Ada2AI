/**
 * Slim Shiki Re-export
 *
 * Re-exports createHighlighter and a limited bundledLanguages map
 * containing only the languages needed for this sports platform.
 * This prevents Vite from bundling ALL 235 Shiki language grammars
 * (which adds ~7.5MB to the bundle).
 *
 * The Streamdown code-block module imports {createHighlighter, bundledLanguages} from 'shiki',
 * which pulls in every language grammar via dynamic imports. By aliasing
 * the 'shiki' import to this slim module, we only include the ~15
 * languages we actually use.
 */

export * from "@shikijs/core";
import { createBundledHighlighter } from "@shikijs/core";
import { bundledThemes, bundledThemesInfo } from "shiki/themes";
export { bundledThemes, bundledThemesInfo };
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
export { createJavaScriptRegexEngine };

// Import only the language grammars we need — these are the same ones
// that Streamdown's main chunk already statically imports
import langCss from "shiki/langs/css.mjs";
import langGo from "shiki/langs/go.mjs";
import langHtml from "shiki/langs/html.mjs";
import langJavascript from "shiki/langs/javascript.mjs";
import langJson from "shiki/langs/json.mjs";
import langJsx from "shiki/langs/jsx.mjs";
import langMarkdown from "shiki/langs/markdown.mjs";
import langPython from "shiki/langs/python.mjs";
import langShellscript from "shiki/langs/shellscript.mjs";
import langSql from "shiki/langs/sql.mjs";
import langToml from "shiki/langs/toml.mjs";
import langTsx from "shiki/langs/tsx.mjs";
import langTypescript from "shiki/langs/typescript.mjs";
import langYaml from "shiki/langs/yaml.mjs";

// Limited bundledLanguages — only the languages this app needs
// This replaces the full bundledLanguages from shiki which has 235 entries
// Using 'as any' because Shiki's internal LanguageInput type chain is deeply nested
// and not publicly exported in a way compatible with our static grammar imports
export const bundledLanguages = {
  css: () => Promise.resolve([langCss]),
  go: () => Promise.resolve([langGo]),
  golang: () => Promise.resolve([langGo]),
  html: () => Promise.resolve([langHtml]),
  javascript: () => Promise.resolve([langJavascript]),
  js: () => Promise.resolve([langJavascript]),
  json: () => Promise.resolve([langJson]),
  jsx: () => Promise.resolve([langJsx]),
  markdown: () => Promise.resolve([langMarkdown]),
  md: () => Promise.resolve([langMarkdown]),
  python: () => Promise.resolve([langPython]),
  py: () => Promise.resolve([langPython]),
  shellscript: () => Promise.resolve([langShellscript]),
  bash: () => Promise.resolve([langShellscript]),
  sh: () => Promise.resolve([langShellscript]),
  shell: () => Promise.resolve([langShellscript]),
  sql: () => Promise.resolve([langSql]),
  toml: () => Promise.resolve([langToml]),
  tsx: () => Promise.resolve([langTsx]),
  typescript: () => Promise.resolve([langTypescript]),
  ts: () => Promise.resolve([langTypescript]),
  yaml: () => Promise.resolve([langYaml]),
  yml: () => Promise.resolve([langYaml]),
} as any;

export const bundledLanguagesInfo = Object.entries(bundledLanguages).map(
  ([id]) => ({ id, name: id, import: bundledLanguages[id] })
);

// Aliases and base maps (empty since we handle aliases in bundledLanguages)
export const bundledLanguagesAlias: Record<string, string> = {};
export const bundledLanguagesBase: Record<string, () => Promise<unknown[]>> = {};

// Create a slim createHighlighter that only knows about our selected languages
// This matches how shiki's bundle-full.mjs creates createHighlighter
const createHighlighter = /* @__PURE__ */ createBundledHighlighter({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRegexEngine({ forgiving: true }),
});

export { createHighlighter };