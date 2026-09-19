// Automatically adapt base URL for local development vs production
const isLocal = typeof window !== 'undefined' && (
  window.location?.hostname === 'localhost' ||
  window.location?.hostname === '127.0.0.1'
);

export const baseURL = isLocal
  ? "http://127.0.0.1:8000/fci/"
  : "https://kissan-e-mandi.onrender.com/fci/";

export const wsBaseURL = isLocal
  ? "ws://127.0.0.1:8000/ws/"
  : "wss://kissan-e-mandi.onrender.com/ws/";

export const userURL = baseURL + "users/";
export const cropURL = baseURL + "crops/";
export const listingsURL = baseURL + "crop_registers/";
export const authURL = baseURL + "login/";
export const refreshURL = baseURL + "token/refresh/";
export const transactionsURL = baseURL + "transactions/";
export const readOnlyURL = baseURL + "readonly/";
export const mspValuationURL = baseURL + "msp-valuation/evaluate/";
