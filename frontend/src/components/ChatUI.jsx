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
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-panel/70 shadow-2xl backdrop-blur">
      <div className="border-b border-slate-700 px-4 py-3">
        <h2 className="text-lg font-semibold text-white">AI Healthcare Support Chat</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`max-w-[90%] ${msg.role === "user" ? "ml-auto" : ""}`}>
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-slate-950"
                  : "bg-slate-800 text-slate-100"
              }`}
            >
              {msg.text}
            </div>
            {msg.meta && (
              <div className="mt-2 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-xs text-slate-300">
                <p>
                  Intent: <span className="text-white">{msg.meta.intent}</span> | Urgency:{" "}
                  <span className="text-white">{msg.meta.urgency}</span> | Emotion:{" "}
                  <span className="text-white">{msg.meta.emotion}</span>
                </p>
                <p>
                  Confidence: <span className="text-white">{msg.meta.confidence}%</span> |
                  Resolved:{" "}
                  <span className={msg.meta.resolved ? "text-success" : "text-warning"}>
                    {String(msg.meta.resolved)}
                  </span>
                </p>
                {msg.meta.patientName && (
                  <p>
                    Patient: <span className="text-white">{msg.meta.patientName}</span>
                  </p>
                )}
                {msg.meta.bookingStatus !== "none" && (
                  <p>
                    Booking:{" "}
                    <span className="text-white">
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
                  <span className="text-slate-200">
                    {msg.meta.sources.length ? msg.meta.sources.join(", ") : "None"}
                  </span>
                </p>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="max-w-[80%] rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={onSend} className="border-t border-slate-700 p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: 'My name is Rahul' or 'Book 10:15 AM slot for shoulder pain'"
            className="flex-1 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-accent px-4 py-2 font-medium text-slate-950 transition hover:brightness-110 disabled:opacity-50"
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
            className="rounded-xl border border-slate-600 px-4 py-2 font-medium text-slate-200 transition hover:border-slate-400"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
