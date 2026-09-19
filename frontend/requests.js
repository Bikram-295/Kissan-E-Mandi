import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshURL } from "./urls";

const api = axios.create();
const refreshClient = axios.create();

let refreshPromise = null;

const isPublicRequest = (config) => {
  const url = config.url || "";
  const method = (config.method || "get").toLowerCase();
  if (url.includes("/login/") || url.includes("/token/refresh/")) {
    return true;
  }
  if (url.includes("/users/") && method === "post") {
    return true;
  }
  return false;
};

api.interceptors.request.use(async (config) => {
  if (!isPublicRequest(config)) {
    const access = await AsyncStorage.getItem("access");
    if (access) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access}`;
    }
  }
  return config;
});

const refreshAccessToken = async () => {
  const refresh = await AsyncStorage.getItem("refresh");
  if (!refresh) {
    throw new Error("No refresh token");
  }
  const { data } = await refreshClient.post(refreshURL, { refresh });
  await AsyncStorage.setItem("access", data.access);
  if (data.refresh) {
    await AsyncStorage.setItem("refresh", data.refresh);
  }
  return data.access;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      original &&
      !original._retry &&
      !isPublicRequest(original)
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const access = await refreshPromise;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch (refreshError) {
        await AsyncStorage.multiRemove(["access", "refresh", "id", "username", "city", "state", "dealer_type", "role"]);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const fetcher = (url) => {
  return api.get(url).then((res) => res.data);
};

export const creator = (url, { arg }) => {
  console.log("POSTING to:", url, "Body:", arg);
  return api
    .post(url, arg)
    .then((res) => {
      console.log("POST Success:", res.data);
      return res.data;
    })
    .catch((error) => {
      console.error("POST Error details:", error.response ? error.response.data : error.message);
      throw error;
    });
};

export const updater = (url, { arg }) => {
  console.log(arg);
  return api.put(`${url}${arg.id}/`, arg).then((res) => res.data);
};
