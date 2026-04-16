import { useEffect, useState } from "react";
import ChatUI from "./components/ChatUI";
import Dashboard from "./components/Dashboard";
import { getMetrics } from "./services/api";

function buildSessionId() {
  const random = Math.random().toString(36).slice(2, 10);
  return `session_${Date.now()}_${random}`;
}

function getOrCreateSessionId() {
  const key = "healthcare_support_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const created = buildSessionId();
  sessionStorage.setItem(key, created);
  return created;
}

export default function App() {
  const [metrics, setMetrics] = useState({});
  const [sessionId] = useState(getOrCreateSessionId());

  useEffect(() => {
    let active = true;

    const fetchMetrics = async () => {
      try {
        const data = await getMetrics();
        if (active) setMetrics(data);
      } catch (error) {
        // Silent failure keeps demo smooth even if backend restarts.
      }
    };

    fetchMetrics();
    const id = setInterval(fetchMetrics, 3000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <main className="min-h-screen px-4 py-8 text-slate-100 md:px-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="relative overflow-hidden rounded-3xl border border-sky-300/30 bg-gradient-to-r from-blue-950/85 via-indigo-950/80 to-cyan-950/80 p-6 shadow-[0_20px_60px_rgba(14,165,233,0.25)] backdrop-blur-xl">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="absolute -left-10 -bottom-12 h-44 w-44 rounded-full bg-emerald-300/15 blur-2xl" />
          <h1 className="relative text-2xl font-bold tracking-tight text-slate-50 md:text-4xl">
            Healthcare AI Customer Support
          </h1>
          <p className="relative mt-2 text-sm text-slate-200 md:text-base">
            RAG-powered assistant with triage safety, source-grounded responses, and live
            resolution analytics.
          </p>
        </header>

        <Dashboard metrics={metrics} />
        <ChatUI sessionId={sessionId} />
      </div>
    </main>
  );
}
