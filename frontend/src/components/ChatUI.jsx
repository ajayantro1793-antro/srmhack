import { useEffect, useState } from "react";
import { sendMessage } from "../services/api";

function storageKey(sessionId) {
  return `healthcare_support_messages_${sessionId}`;
}

function loadMessages(sessionId) {
  const raw = sessionStorage.getItem(storageKey(sessionId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch (error) {
    // Ignore malformed cache and reset to default.
  }
  return null;
}

export default function ChatUI({ sessionId }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    return (
      loadMessages(sessionId) || [
        {
          role: "assistant",
          text: "Hello, I am your healthcare support assistant. How can I help you today?",
          meta: null,
        },
      ]
    );
  });

  useEffect(() => {
    sessionStorage.setItem(storageKey(sessionId), JSON.stringify(messages));
  }, [messages, sessionId]);

  const onSend = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendMessage(message, sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer,
          meta: {
            intent: res.intent,
            urgency: res.urgency,
            confidence: Math.round((res.confidence || 0) * 100),
            resolved: res.resolved,
            emotion: res.emotion,
            sources: res.sources || [],
            bookingStatus: res.booking_status || "none",
            bookingId: res.booking_id || "",
            bookedSlot: res.booked_slot || "",
            bookedDepartment: res.booked_department || "",
            patientName: res.patient_name || "",
          },
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I ran into a connection issue. Please try again.",
          meta: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-3xl border border-sky-300/25 bg-gradient-to-b from-slate-900/80 via-blue-950/80 to-indigo-950/75 shadow-[0_18px_45px_rgba(8,47,73,0.45)] backdrop-blur-xl">
      <div className="border-b border-sky-200/15 bg-slate-900/40 px-4 py-3">
        <h2 className="text-lg font-semibold tracking-tight text-cyan-50">AI Healthcare Support Chat</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`max-w-[90%] ${msg.role === "user" ? "ml-auto" : ""}`}>
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 text-slate-950 shadow-[0_8px_22px_rgba(56,189,248,0.35)]"
                  : "border border-sky-100/10 bg-slate-800/85 text-slate-100 shadow-[0_8px_22px_rgba(2,6,23,0.4)]"
              }`}
            >
              {msg.text}
            </div>
            {msg.meta && (
              <div className="mt-2 rounded-xl border border-sky-300/20 bg-slate-950/45 p-3 text-xs text-slate-200">
                <p>
                  Intent: <span className="text-cyan-200">{msg.meta.intent}</span> | Urgency:{" "}
                  <span className="text-cyan-200">{msg.meta.urgency}</span> | Emotion:{" "}
                  <span className="text-cyan-200">{msg.meta.emotion}</span>
                </p>
                <p>
                  Confidence: <span className="text-cyan-200">{msg.meta.confidence}%</span> |
                  Resolved:{" "}
                  <span className={msg.meta.resolved ? "text-success" : "text-warning"}>
                    {String(msg.meta.resolved)}
                  </span>
                </p>
                {msg.meta.patientName && (
                  <p>
                    Patient: <span className="text-cyan-200">{msg.meta.patientName}</span>
                  </p>
                )}
                {msg.meta.bookingStatus !== "none" && (
                  <p>
                    Booking:{" "}
                    <span className="text-cyan-200">
                      {msg.meta.bookingStatus}
                      {msg.meta.bookingId ? ` (${msg.meta.bookingId})` : ""}
                    </span>
                    {msg.meta.bookedDepartment && msg.meta.bookedSlot
                      ? ` | ${msg.meta.bookedDepartment} @ ${msg.meta.bookedSlot}`
                      : ""}
                  </p>
                )}
                <p className="mt-1">
                  Sources:{" "}
                  <span className="text-slate-100">
                    {msg.meta.sources.length ? msg.meta.sources.join(", ") : "None"}
                  </span>
                </p>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="max-w-[80%] rounded-2xl border border-sky-100/10 bg-slate-800/80 px-4 py-3 text-sm text-slate-200">
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={onSend} className="border-t border-sky-100/15 bg-slate-950/35 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: 'My name is Rahul' or 'Book 10:15 AM slot for shoulder pain'"
            className="flex-1 rounded-xl border border-sky-300/30 bg-slate-900/80 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-cyan-300 to-sky-400 px-5 py-2 font-semibold text-slate-950 shadow-[0_8px_22px_rgba(56,189,248,0.35)] transition hover:brightness-110 disabled:opacity-50"
          >
            Send
          </button>
          <button
            type="button"
            onClick={() => {
              const reset = [
                {
                  role: "assistant",
                  text: "Chat memory cleared. How can I help you now?",
                  meta: null,
                },
              ];
              setMessages(reset);
              sessionStorage.setItem(storageKey(sessionId), JSON.stringify(reset));
            }}
            className="rounded-xl border border-cyan-300/30 bg-slate-900/60 px-4 py-2 font-medium text-cyan-100 transition hover:border-cyan-200 hover:bg-slate-900"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
