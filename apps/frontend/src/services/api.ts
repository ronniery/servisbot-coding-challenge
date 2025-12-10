import Axios from "axios";
import { setupCache } from "axios-cache-interceptor";

import { getEnvironment } from "../configuration";

const instance = Axios.create({
  baseURL: getEnvironment().API_BASE_URL,
});

export const apiClient = setupCache(instance, {
  ttl: 60 * 1000, // 1 minute
});

export default apiClient;
