"use client";

import { useState, useRef, useCallback } from "react";
import { OcrJob, EXPORT_FORMATS } from "@/lib/types";
import {
  downloadFile,
  exportAsJson,
  exportAsCsv,
  exportAsMarkdown,
} from "@/lib/ocr";

interface Props {
  job: OcrJob;
}

export function ResultPanel({ job }: Props) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = useCallback(async () => {
    if (!job.result) return;
    await navigator.clipboard.writeText(job.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [job.result]);

  const handleExport = useCallback(
    (fmt: (typeof EXPORT_FORMATS)[number]) => {
      const base = job.fileName.replace(/\.[^.]+$/, "");
      if (fmt.ext === "json") {
        downloadFile(exportAsJson([job]), `${base}.json`, fmt.mime);
      } else if (fmt.ext === "csv") {
        downloadFile(exportAsCsv([job]), `${base}.csv`, fmt.mime);
      } else if (fmt.ext === "md") {
        downloadFile(exportAsMarkdown([job]), `${base}.md`, fmt.mime);
      } else {
        downloadFile(job.result || "", `${base}.txt`, fmt.mime);
      }
    },
    [job]
  );

  const confidenceColor =
    (job.confidence ?? 0) >= 80
      ? "text-green-400"
      : (job.confidence ?? 0) >= 50
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-200">
            📄 {job.fileName}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className={confidenceColor}>
              {(job.confidence ?? 0).toFixed(1)}% confident
            </span>
            <span>·</span>
            <span>{job.wordCount} words</span>
            <span>·</span>
            <span>{job.charCount} chars</span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${
                (job.confidence ?? 0) >= 80
                  ? "bg-green-500"
                  : (job.confidence ?? 0) >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${job.confidence ?? 0}%` }}
            />
          </div>
        </div>

        {/* Text area */}
        <textarea
          ref={textRef}
          value={job.result || ""}
          readOnly
          className="mt-3 h-64 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-300 focus:border-teal-400 focus:outline-none"
        />

        {/* Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="tool-btn text-xs"
          >
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="tool-btn-ghost text-xs"
          >
            {showPreview ? "Hide" : "Show"} Preview
          </button>

          {EXPORT_FORMATS.map((fmt) => (
            <button
              key={fmt.ext}
              onClick={() => handleExport(fmt)}
              className="tool-btn-ghost text-xs"
            >
              ⬇ .{fmt.ext}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h4 className="mb-2 text-xs font-medium text-slate-500">
            FORMATTED PREVIEW
          </h4>
          <div className="prose prose-invert prose-sm max-w-none">
            <pre className="whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-xs text-slate-300">
              {job.result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
