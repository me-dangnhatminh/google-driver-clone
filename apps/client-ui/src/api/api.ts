/* eslint-disable @typescript-eslint/no-namespace */
import axios, {
  AxiosError,
  AxiosResponse,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

const env = import.meta.env;
const baseURL: string = env.VITE_API_URL;
const timeout: number = 100000; // 100s
if (!baseURL) throw new Error("API URL is not defined");

export const apiInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: timeout,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  // validateStatus: (status) => status >= 200 && status < 500,
});

export async function responseSuccess(res: AxiosResponse) {
  return res;
}

export async function responseFailure(axiosErr: AxiosError) {
  const res = axiosErr?.response;
  const status = res?.status;

  if (status === 401) {
    window.location.reload();
  }

  throw axiosErr;
}

apiInstance.interceptors.response.use(responseSuccess, responseFailure);

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export class Api {
  static get baseURL() {
    return apiInstance.defaults.baseURL;
  }

  static get<T = unknown>(
    url: string,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    return apiInstance.get<T>(url, { ...config, params: queryParams });
  }

  static post<T>(
    url: string,
    body?: unknown,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    return apiInstance.post<T>(url, body, { ...config, params: queryParams });
  }

  static async put<T>(
    url: string,
    body?: unknown,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    return apiInstance.put<T>(url, body, { ...config, params: queryParams });
  }

  static async patch<T>(
    url: string,
    body?: unknown,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    return apiInstance.patch<T>(url, body, { ...config, params: queryParams });
  }

  static async delete<T>(
    url: string,
    queryParams?: unknown,
    config: AxiosRequestConfig = {}
  ) {
    return apiInstance.delete<T>(url, { ...config, params: queryParams });
  }
}

export default Api;
