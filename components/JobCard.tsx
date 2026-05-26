"use client";

import { OcrJob } from "@/lib/types";

interface Props {
  job: OcrJob;
  selected: boolean;
  onSelect: () => void;
  onRetry: () => void;
}

export function JobCard({ job, selected, onSelect, onRetry }: Props) {
  const statusConfig = {
    pending: { icon: "⏳", color: "text-slate-500", bg: "bg-slate-800" },
    processing: { icon: "⚡", color: "text-teal-400", bg: "bg-teal-900/30" },
    done: { icon: "✅", color: "text-green-400", bg: "bg-green-900/20" },
    error: { icon: "❌", color: "text-red-400", bg: "bg-red-900/20" },
  };

  const st = statusConfig[job.status];

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border p-3 cursor-pointer transition-all ${
        selected
          ? "border-teal-500 bg-slate-800/80 ring-1 ring-teal-500/30"
          : "border-slate-800 bg-slate-900 hover:border-slate-700"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Thumbnail */}
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={job.imageData}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-200">
            {job.fileName}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            <span>{st.icon}</span>
            <span className={st.color}>
              {job.status === "processing"
                ? `${job.progress}%`
                : job.status === "done"
                  ? `${job.wordCount} words · ${(job.confidence ?? 0).toFixed(0)}%`
                  : job.status === "error"
                    ? "Failed"
                    : "Pending"}
            </span>
            {job.status === "done" && (
              <span className="text-slate-600">
                · {job.lines} lines
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {job.status === "processing" && (
          <div className="w-16">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Retry */}
        {job.status === "error" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
          >
            Retry
          </button>
        )}
      </div>

      {/* Error message */}
      {job.status === "error" && job.error && (
        <p className="mt-2 truncate text-xs text-red-400/70">{job.error}</p>
      )}
    </div>
  );
}
