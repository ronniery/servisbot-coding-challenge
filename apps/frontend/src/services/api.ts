import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

const API_BASE_URL = "http://localhost:3000";

const instance = Axios.create({
  baseURL: API_BASE_URL,
});

export const apiClient = setupCache(instance, {
  ttl: 60 * 1000, // 1 minute
});

export default apiClient;
