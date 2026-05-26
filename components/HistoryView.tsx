"use client";

import { useState, useCallback } from "react";
import { OcrJob, EXPORT_FORMATS } from "@/lib/types";
import {
  downloadFile,
  exportAsJson,
  exportAsCsv,
  exportAsMarkdown,
} from "@/lib/ocr";
import { deleteJob, clearJobs } from "@/lib/storage";

interface Props {
  jobs: OcrJob[];
  onRefresh: () => void;
}

export function HistoryView({ jobs, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = jobs.filter(
    (j) =>
      j.fileName.toLowerCase().includes(search.toLowerCase()) ||
      (j.result || "").toLowerCase().includes(search.toLowerCase())
  );

  const doneJobs = filtered.filter((j) => j.status === "done");

  const handleDelete = useCallback(
    (id: string) => {
      deleteJob(id);
      onRefresh();
    },
    [onRefresh]
  );

  const handleClear = useCallback(() => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearJobs();
    setConfirmClear(false);
    onRefresh();
  }, [confirmClear, onRefresh]);

  const handleExportAll = useCallback(
    (fmt: (typeof EXPORT_FORMATS)[number]) => {
      const base = `ocr-export-${new Date().toISOString().slice(0, 10)}`;
      if (fmt.ext === "json") {
        downloadFile(exportAsJson(doneJobs), `${base}.json`, fmt.mime);
      } else if (fmt.ext === "csv") {
        downloadFile(exportAsCsv(doneJobs), `${base}.csv`, fmt.mime);
      } else if (fmt.ext === "md") {
        downloadFile(exportAsMarkdown(doneJobs), `${base}.md`, fmt.mime);
      } else {
        const combined = doneJobs
          .map((j) => `=== ${j.fileName} ===\n\n${j.result}`)
          .join("\n\n\n");
        downloadFile(combined, `${base}.txt`, fmt.mime);
      }
    },
    [doneJobs]
  );

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl">📭</div>
        <p className="mt-4 text-sm text-slate-400">Belum ada history OCR</p>
        <p className="mt-1 text-xs text-slate-600">
          Scan gambar pertama lo di tab Scan
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="🔍 Search filename atau text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="tool-input flex-1"
        />
        <div className="flex gap-2">
          {EXPORT_FORMATS.map((fmt) => (
            <button
              key={fmt.ext}
              onClick={() => handleExportAll(fmt)}
              className="tool-btn-ghost text-xs"
              disabled={doneJobs.length === 0}
            >
              ⬇ All .{fmt.ext}
            </button>
          ))}
          <button
            onClick={handleClear}
            className={`text-xs rounded-lg border px-3 py-2 transition-colors ${
              confirmClear
                ? "border-red-500 bg-red-900/30 text-red-400"
                : "border-slate-700 text-slate-400 hover:text-red-400"
            }`}
          >
            {confirmClear ? "⚠️ Confirm?" : "🗑 Clear"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-slate-500">
        <span>{jobs.length} total</span>
        <span>{jobs.filter((j) => j.status === "done").length} completed</span>
        <span>{jobs.filter((j) => j.status === "error").length} failed</span>
        <span>
          {jobs
            .reduce((sum, j) => sum + (j.wordCount || 0), 0)
            .toLocaleString()}{" "}
          words extracted
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-500">
              <th className="pb-2 pr-4">File</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Words</th>
              <th className="pb-2 pr-4">Confidence</th>
              <th className="pb-2 pr-4">Date</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => (
              <tr
                key={job.id}
                className="border-b border-slate-800/50 hover:bg-slate-900/50"
              >
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={job.imageData}
                      alt=""
                      className="h-8 w-8 rounded object-cover"
                    />
                    <span className="truncate text-slate-300 max-w-[200px]">
                      {job.fileName}
                    </span>
                  </div>
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={`text-xs ${
                      job.status === "done"
                        ? "text-green-400"
                        : job.status === "error"
                          ? "text-red-400"
                          : job.status === "processing"
                            ? "text-teal-400"
                            : "text-slate-500"
                    }`}
                  >
                    {job.status === "done"
                      ? "✅"
                      : job.status === "error"
                        ? "❌"
                        : job.status === "processing"
                          ? "⚡"
                          : "⏳"}
                  </span>
                </td>
                <td className="py-2 pr-4 text-slate-400">
                  {job.wordCount?.toLocaleString() || "—"}
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      (job.confidence ?? 0) >= 80
                        ? "text-green-400"
                        : (job.confidence ?? 0) >= 50
                          ? "text-yellow-400"
                          : "text-red-400"
                    }
                  >
                    {job.confidence?.toFixed(0) || "—"}%
                  </span>
                </td>
                <td className="py-2 pr-4 text-xs text-slate-500">
                  {new Date(job.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2">
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
