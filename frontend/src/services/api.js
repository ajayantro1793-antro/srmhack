const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function sendMessage(message, sessionId) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!response.ok) {
    throw new Error("Chat request failed");
  }
  return response.json();
}

export async function getMetrics() {
  const response = await fetch(`${API_BASE}/metrics`);
  if (!response.ok) {
    throw new Error("Metrics request failed");
  }
  return response.json();
}
