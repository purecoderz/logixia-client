import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";

export const LANGUAGE_EXTENSIONS = {
    javascript: javascript({ jsx: true }),
    typescript: javascript({ typescript: true, jsx: true }),
    python: python(),
    json: json(),
    markdown: markdown(),
    plaintext: [],
};

export type SupportedLanguage = keyof typeof LANGUAGE_EXTENSIONS;