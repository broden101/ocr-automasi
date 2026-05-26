export interface OcrJob {
  id: string;
  fileName: string;
  imageData: string; // base64 data URL
  status: "pending" | "processing" | "done" | "error";
  progress: number; // 0-100
  result?: string;
  confidence?: number;
  language: string;
  createdAt: number;
  completedAt?: number;
  error?: string;
  wordCount?: number;
  charCount?: number;
  lines?: number;
}

export interface OcrSettings {
  language: string;
  autoSave: boolean;
  darkMode: boolean;
  maxHistory: number;
}

export type TabId = "scan" | "history" | "settings";

export interface ExportFormat {
  label: string;
  ext: string;
  mime: string;
}

export const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "ind", label: "Bahasa Indonesia" },
  { code: "chi_sim", label: "中文简体" },
  { code: "chi_tra", label: "中文繁體" },
  { code: "jpn", label: "日本語" },
  { code: "kor", label: "한국어" },
  { code: "ara", label: "العربية" },
  { code: "tha", label: "ภาษาไทย" },
  { code: "vie", label: "Tiếng Việt" },
  { code: "msa", label: "Bahasa Melayu" },
  { code: "deu", label: "Deutsch" },
  { code: "fra", label: "Français" },
  { code: "spa", label: "Español" },
  { code: "por", label: "Português" },
  { code: "rus", label: "Русский" },
  { code: "ita", label: "Italiano" },
] as const;

export const EXPORT_FORMATS: ExportFormat[] = [
  { label: "Plain Text", ext: "txt", mime: "text/plain" },
  { label: "JSON", ext: "json", mime: "application/json" },
  { label: "CSV", ext: "csv", mime: "text/csv" },
  { label: "Markdown", ext: "md", mime: "text/markdown" },
];

export const DEFAULT_SETTINGS: OcrSettings = {
  language: "eng",
  autoSave: true,
  darkMode: true,
  maxHistory: 100,
};
