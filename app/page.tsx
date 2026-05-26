"use client";

import { useState, useEffect, useCallback } from "react";
import { TabId, OcrSettings, OcrJob } from "@/lib/types";
import { loadSettings, loadJobs } from "@/lib/storage";
import { ScanView } from "@/components/ScanView";
import { HistoryView } from "@/components/HistoryView";
import { SettingsView } from "@/components/SettingsView";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "scan", label: "Scan", icon: "📷" },
  { id: "history", label: "History", icon: "📋" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Home() {
  const [tab, setTab] = useState<TabId>("scan");
  const [settings, setSettings] = useState<OcrSettings>(loadSettings());
  const [jobs, setJobs] = useState<OcrJob[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setJobs(loadJobs());
  }, []);

  const refreshJobs = useCallback(() => {
    setJobs(loadJobs());
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl">🔍</div>
          <p className="mt-3 text-sm text-slate-400">Loading OCR engine...</p>
        </div>
      </div>
    );
  }

  const doneCount = jobs.filter((j) => j.status === "done").length;
  const totalWords = jobs.reduce((s, j) => s + (j.wordCount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              🔍 OCR Automasi
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Upload gambar → extract text. 100% browser, zero server.
            </p>
          </div>
          {doneCount > 0 && (
            <div className="text-right text-xs text-slate-500">
              <p>{doneCount} scans completed</p>
              <p>{totalWords.toLocaleString()} words extracted</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <nav className="mt-6 flex gap-1 rounded-lg bg-slate-900 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? "bg-slate-800 text-teal-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.id === "history" && jobs.length > 0 && (
                <span className="ml-1 rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
                  {jobs.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main>
        {tab === "scan" && (
          <ScanView
            language={settings.language}
            onJobComplete={refreshJobs}
          />
        )}
        {tab === "history" && (
          <HistoryView jobs={jobs} onRefresh={refreshJobs} />
        )}
        {tab === "settings" && (
          <SettingsView settings={settings} onChange={setSettings} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 pt-4 text-center text-xs text-slate-600">
        OCR Automasi · Powered by Tesseract.js · 100% Client-Side
      </footer>
    </div>
  );
}
