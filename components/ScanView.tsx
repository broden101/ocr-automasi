"use client";

import { useState, useCallback, useRef } from "react";
import { OcrJob } from "@/lib/types";
import { generateId, addJob, updateJob } from "@/lib/storage";
import { runOcr, fileToDataUrl, getTextStats } from "@/lib/ocr";
import { ImageUploader } from "@/components/ImageUploader";
import { JobCard } from "@/components/JobCard";
import { ResultPanel } from "@/components/ResultPanel";

interface Props {
  language: string;
  onJobComplete: () => void;
}

export function ScanView({ language, onJobComplete }: Props) {
  const [jobs, setJobs] = useState<OcrJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<OcrJob | null>(null);
  const processingRef = useRef(false);

  const processJob = useCallback(
    async (job: OcrJob) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "processing" as const, progress: 0 } : j))
      );
      updateJob(job.id, { status: "processing", progress: 0 });

      try {
        const { text, confidence } = await runOcr(job, (p) => {
          const pct = Math.round(p.progress * 100);
          setJobs((prev) =>
            prev.map((j) => (j.id === job.id ? { ...j, progress: pct } : j))
          );
        });

        const stats = getTextStats(text);
        const completed: Partial<OcrJob> = {
          status: "done",
          progress: 100,
          result: text,
          confidence,
          completedAt: Date.now(),
          wordCount: stats.words,
          charCount: stats.chars,
          lines: stats.lines,
        };

        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, ...completed } : j))
        );
        updateJob(job.id, completed);
        onJobComplete();
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? { ...j, status: "error" as const, error: errMsg }
              : j
          )
        );
        updateJob(job.id, { status: "error", error: errMsg });
      }
    },
    [onJobComplete]
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      const newJobs: OcrJob[] = [];
      for (const file of files) {
        const imageData = await fileToDataUrl(file);
        const job: OcrJob = {
          id: generateId(),
          fileName: file.name,
          imageData,
          status: "pending",
          progress: 0,
          language,
          createdAt: Date.now(),
        };
        newJobs.push(job);
        addJob(job);
      }

      setJobs((prev) => [...newJobs, ...prev]);

      // Process sequentially
      for (const job of newJobs) {
        await processJob(job);
      }
    },
    [language, processJob]
  );

  const handleRetry = useCallback(
    (job: OcrJob) => {
      const reset: Partial<OcrJob> = {
        status: "pending",
        progress: 0,
        result: undefined,
        error: undefined,
        confidence: undefined,
      };
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, ...reset } : j))
      );
      updateJob(job.id, reset);
      processJob({ ...job, ...reset });
    },
    [processJob]
  );

  return (
    <div className="space-y-6">
      <ImageUploader onFiles={handleFiles} />

      {jobs.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400">
              Jobs ({jobs.length})
            </h3>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={selectedJob?.id === job.id}
                onSelect={() => setSelectedJob(job)}
                onRetry={() => handleRetry(job)}
              />
            ))}
          </div>

          {selectedJob && selectedJob.status === "done" && (
            <ResultPanel job={selectedJob} />
          )}
        </div>
      )}
    </div>
  );
}
