import { OcrJob, OcrSettings, DEFAULT_SETTINGS } from "./types";

const JOBS_KEY = "ocr-jobs";
const SETTINGS_KEY = "ocr-settings";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Jobs ──────────────────────────────────────────────────

export function loadJobs(): OcrJob[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveJobs(jobs: OcrJob[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch {
    // quota exceeded — trim oldest
    const trimmed = jobs.slice(-50);
    localStorage.setItem(JOBS_KEY, JSON.stringify(trimmed));
  }
}

export function addJob(job: OcrJob): OcrJob[] {
  const jobs = loadJobs();
  jobs.unshift(job);
  saveJobs(jobs);
  return jobs;
}

export function updateJob(id: string, updates: Partial<OcrJob>): OcrJob[] {
  const jobs = loadJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx !== -1) {
    jobs[idx] = { ...jobs[idx], ...updates };
    saveJobs(jobs);
  }
  return jobs;
}

export function deleteJob(id: string): OcrJob[] {
  const jobs = loadJobs().filter((j) => j.id !== id);
  saveJobs(jobs);
  return jobs;
}

export function clearJobs(): void {
  saveJobs([]);
}

// ── Settings ──────────────────────────────────────────────

export function loadSettings(): OcrSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: OcrSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
