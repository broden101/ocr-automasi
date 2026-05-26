"use client";

import { useState, useEffect, useCallback } from "react";
import { OcrSettings, LANGUAGES, DEFAULT_SETTINGS } from "@/lib/types";
import { loadSettings, saveSettings } from "@/lib/storage";

interface Props {
  settings: OcrSettings;
  onChange: (s: OcrSettings) => void;
}

export function SettingsView({ settings, onChange }: Props) {
  const [local, setLocal] = useState<OcrSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocal(settings);
  }, [settings]);

  const handleSave = useCallback(() => {
    saveSettings(local);
    onChange(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [local, onChange]);

  const handleReset = useCallback(() => {
    setLocal(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    onChange(DEFAULT_SETTINGS);
  }, [onChange]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-medium text-slate-200">⚙️ Settings</h3>
        <p className="mt-1 text-xs text-slate-500">
          Konfigurasi default OCR engine
        </p>

        {/* Language */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-300">
            Default Language
          </label>
          <p className="mt-0.5 text-xs text-slate-500">
            Bahasa yang dipakai untuk OCR recognition
          </p>
          <select
            value={local.language}
            onChange={(e) =>
              setLocal((s) => ({ ...s, language: e.target.value }))
            }
            className="tool-input mt-2"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label} ({l.code})
              </option>
            ))}
          </select>
        </div>

        {/* Max History */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300">
            Max History Items
          </label>
          <input
            type="number"
            min={10}
            max={500}
            value={local.maxHistory}
            onChange={(e) =>
              setLocal((s) => ({
                ...s,
                maxHistory: parseInt(e.target.value) || 100,
              }))
            }
            className="tool-input mt-2"
          />
        </div>

        {/* Auto-save toggle */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">Auto-save</p>
            <p className="text-xs text-slate-500">
              Simpan hasil otomatis ke history
            </p>
          </div>
          <button
            onClick={() =>
              setLocal((s) => ({ ...s, autoSave: !s.autoSave }))
            }
            className={`relative h-6 w-11 rounded-full transition-colors ${
              local.autoSave ? "bg-teal-500" : "bg-slate-700"
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                local.autoSave ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Storage info */}
        <div className="mt-6 rounded-lg bg-slate-950 p-3">
          <p className="text-xs text-slate-500">💾 Storage</p>
          <p className="mt-1 text-xs text-slate-400">
            Semua data disimpan di browser localStorage. Tidak ada data yang
            dikirim ke server.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button onClick={handleSave} className="tool-btn flex-1">
            {saved ? "✓ Saved!" : "💾 Save Settings"}
          </button>
          <button onClick={handleReset} className="tool-btn-ghost">
            Reset
          </button>
        </div>
      </div>

      {/* About */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-sm font-medium text-slate-200">
          ℹ️ Tentang OCR Automasi
        </h3>
        <p className="mt-2 text-xs text-slate-400">
          Browser-based OCR tool powered by Tesseract.js. Semua proses
          recognition jalan di browser lo sendiri — zero server, zero API keys,
          100% private.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded bg-slate-800 px-2 py-1 text-slate-400">
            Next.js 14
          </span>
          <span className="rounded bg-slate-800 px-2 py-1 text-slate-400">
            React 18
          </span>
          <span className="rounded bg-slate-800 px-2 py-1 text-slate-400">
            Tesseract.js 5
          </span>
          <span className="rounded bg-slate-800 px-2 py-1 text-slate-400">
            Tailwind CSS
          </span>
          <span className="rounded bg-slate-800 px-2 py-1 text-slate-400">
            100% Client-Side
          </span>
        </div>
      </div>
    </div>
  );
}
