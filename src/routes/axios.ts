import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://abitus-api.geia.vip",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10000),
});