/**
 * Node/Express API base URL (default port 3000).
 * Set EXPO_PUBLIC_API_URL in .env to match your PC's LAN IP — the same IP Expo prints
 * for Metro (e.g. exp://192.168.1.27:8081), but use port 3000, not 8081.
 */
export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined)?.trim() ||
  "http://192.168.1.27:3000";
