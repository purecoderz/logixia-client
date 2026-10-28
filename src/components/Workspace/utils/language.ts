import type { SupportedLanguage } from "../../CodeEditor/utils/languages"; // adjust the path

const LANGUAGES: Record<string, SupportedLanguage> = {
    py: "python",
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    json: "json",
    md: "markdown",
    txt: "plaintext",
};

export function getLanguage(fileName: string): SupportedLanguage {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    return LANGUAGES[ext] ?? "plaintext";
}