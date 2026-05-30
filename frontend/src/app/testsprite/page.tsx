"use client";

import { useState } from "react";
import {
  generateTestspriteTests,
  createTestspriteRun,
  getTestspriteRunStatus,
  checkTestspriteHealth,
  type TestSpriteRunResponse,
} from "@/lib/api";

export default function TestSpritePage() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [framework, setFramework] = useState("playwright");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generateResult, setGenerateResult] = useState<Record<string, unknown> | null>(null);
  const [runResult, setRunResult] = useState<TestSpriteRunResponse | null>(null);
  const [runStatus, setRunStatus] = useState<Record<string, unknown> | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [health, setHealth] = useState<{ connected: boolean } | null>(null);

  const checkHealth = async () => {
    try {
      const res = await checkTestspriteHealth();
      setHealth({ connected: res.connected });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setHealth({ connected: false });
      setError(msg);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGenerateResult(null);
    try {
      const res = await generateTestspriteTests({ url, description, framework });
      setGenerateResult(res.data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setRunResult(null);
    try {
      const res = await createTestspriteRun({ url });
      setRunResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async () => {
    if (!runResult) return;
    setStatusLoading(true);
    try {
      const res = await getTestspriteRunStatus(runResult.run_id);
      setRunStatus({ status: res.status, results: res.results });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#444444]">TestSprite</h1>
          <p className="text-sm text-[#777]">
            AI-powered E2E testing — generate, run, and monitor visual + functional tests.
          </p>
        </div>
        <button
          onClick={checkHealth}
          className="px-4 py-2 rounded-md text-sm font-medium border transition-colors"
          style={{
            backgroundColor: health?.connected === true ? "#e6f4ea" : health?.connected === false ? "#fce8e8" : "#fff",
            borderColor: health?.connected === true ? "#34a853" : health?.connected === false ? "#ea4335" : "#ddd",
            color: health?.connected === true ? "#188038" : health?.connected === false ? "#c5221f" : "#444",
          }}
        >
          {health?.connected === true ? "● Connected" : health?.connected === false ? "● Disconnected" : "Check Connection"}
        </button>
      </div>

      {/* ── Inputs ── */}
      <div className="bg-white rounded-xl border border-[#ededed] p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#444] mb-1">Target URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 rounded-lg border border-[#ddd] text-sm focus:outline-none focus:ring-2 focus:ring-[#7030A0]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#444] mb-1">Test Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to test, e.g. 'Verify the login flow, checkout process, and navigation menu on mobile'"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-[#ddd] text-sm focus:outline-none focus:ring-2 focus:ring-[#7030A0]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#444] mb-1">Framework</label>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[#ddd] text-sm focus:outline-none focus:ring-2 focus:ring-[#7030A0]"
          >
            <option value="playwright">Playwright</option>
            <option value="cypress">Cypress</option>
            <option value="selenium">Selenium</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading || !url || !description}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: "#7030A0" }}
          >
            {loading ? "Generating…" : "Generate Tests"}
          </button>
          <button
            onClick={handleRun}
            disabled={loading || !url}
            className="px-5 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-50"
            style={{ borderColor: "#7030A0", color: "#7030A0", background: "#fff" }}
          >
            {loading ? "Starting…" : "Run Tests"}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
            {error}
          </div>
        )}
      </div>

      {/* ── Generated tests ── */}
      {generateResult && (
        <div className="bg-white rounded-xl border border-[#ededed] p-6">
          <h2 className="text-lg font-semibold text-[#444] mb-3">Generated Tests</h2>
          <pre className="text-xs bg-[#f7f7f7] p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(generateResult, null, 2)}
          </pre>
        </div>
      )}

      {/* ── Run result ── */}
      {runResult && (
        <div className="bg-white rounded-xl border border-[#ededed] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#444]">Test Run</h2>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: runResult.status === "completed" ? "#e6f4ea" : "#fff7e0",
                color: runResult.status === "completed" ? "#188038" : "#b06000",
              }}
            >
              {runResult.status}
            </span>
          </div>
          <div className="text-sm text-[#666] space-y-1">
            <p><span className="font-medium">Run ID:</span> {runResult.run_id}</p>
            <p><span className="font-medium">URL:</span> {runResult.url}</p>
          </div>
          <button
            onClick={pollStatus}
            disabled={statusLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
            style={{ borderColor: "#7030A0", color: "#7030A0" }}
          >
            {statusLoading ? "Polling…" : "Refresh Status"}
          </button>
          {runStatus && (
            <pre className="text-xs bg-[#f7f7f7] p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(runStatus, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
