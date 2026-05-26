"use client";

import { createWorker } from "tesseract.js";
import { OcrJob } from "./types";

export interface OcrProgress {
  status: string;
  progress: number; // 0-1
}

export async function runOcr(
  job: OcrJob,
  onProgress: (p: OcrProgress) => void
): Promise<{ text: string; confidence: number }> {
  onProgress({ status: "Initializing OCR engine...", progress: 0 });

  const worker = await createWorker(job.language, 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress({ status: "Recognizing text...", progress: m.progress });
      } else if (m.status === "loading language traineddata") {
        onProgress({
          status: "Loading language data...",
          progress: m.progress * 0.5,
        });
      } else {
        onProgress({ status: m.status, progress: m.progress * 0.8 });
      }
    },
  });

  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(job.imageData);
    onProgress({ status: "Done!", progress: 1 });
    return { text: text.trim(), confidence };
  } finally {
    await worker.terminate();
  }
}

export function getTextStats(text: string) {
  const words = text
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const chars = text.length;
  const lines = text.split("\n").filter((l) => l.trim().length > 0).length;
  return { words, chars, lines };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsJson(jobs: OcrJob[]): string {
  return JSON.stringify(
    jobs.map((j) => ({
      file: j.fileName,
      text: j.result,
      confidence: j.confidence,
      language: j.language,
      date: new Date(j.createdAt).toISOString(),
    })),
    null,
    2
  );
}

export function exportAsCsv(jobs: OcrJob[]): string {
  const header = "file,text,confidence,language,date\n";
  const rows = jobs
    .map(
      (j) =>
        `"${j.fileName}","${(j.result || "").replace(/"/g, '""')}","${j.confidence || 0}","${j.language}","${new Date(j.createdAt).toISOString()}"`
    )
    .join("\n");
  return header + rows;
}

export function exportAsMarkdown(jobs: OcrJob[]): string {
  return jobs
    .map(
      (j) =>
        `## ${j.fileName}\n\n> Confidence: ${j.confidence?.toFixed(1)}% | Language: ${j.language} | ${new Date(j.createdAt).toLocaleDateString()}\n\n\`\`\`\n${j.result}\n\`\`\``
    )
    .join("\n\n---\n\n");
}
