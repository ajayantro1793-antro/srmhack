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
        <header className="rounded-2xl border border-slate-700 bg-panel/80 p-5 shadow-xl backdrop-blur">
          <h1 className="text-2xl font-bold md:text-3xl">Healthcare AI Customer Support</h1>
          <p className="mt-1 text-sm text-slate-300">
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
