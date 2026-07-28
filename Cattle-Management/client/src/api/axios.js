import axios from "axios";

function resolveApiBase() {
  const raw = import.meta.env.VITE_API_URL?.trim();

  if (!raw) return "/api";

  if (raw.endsWith("/api")) return raw;
  return `${raw.replace(/\/$/, "")}/api`;
}

const api = axios.create({
  baseURL: resolveApiBase(),
});

export default api;
