import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export type ApiConfig = {
  host?: string;
  port?: number;
  protocol?: string;
  apiVersion?: string;
  timeout?: number;
  prefix?: string;
  maxNetworkRetries?: number;
};
export type ApiConfigRequired = Required<ApiConfig>;
export type RequestOptions = Omit<ApiConfig, "host" | "port" | "protocol">;

export type Response<T> = {
  data: T;
  headers: { [key: string]: string };
  requestId: string;
  statusCode: number;
  apiVersion?: string;
};

export const DEFAULT_API_CONFIG: ApiConfigRequired = {
  host: "localhost",
  port: 3000,
  protocol: "http",
  apiVersion: "v1",
  timeout: 5000,
  prefix: "api",
  maxNetworkRetries: 3,
};

export class Api {
  protected readonly config: ApiConfigRequired;
  protected readonly instance: AxiosInstance;

  constructor(config?: ApiConfig, axiosInstance?: AxiosInstance) {
    const raw = structuredClone(Object.assign({}, DEFAULT_API_CONFIG, config));
    raw.prefix = raw.prefix?.replace(/\/$/, ""); // remove trailing slash
    raw.prefix = raw.prefix ? `/${raw.prefix}` : "";
    this.config = raw;

    // == setup axios instance
    this.instance = axiosInstance || axios.create();
    this.instance.defaults.baseURL = this.baseURL;
    this.instance.defaults.timeout = this.config.timeout;
  }

  private makeURL(options?: ApiConfig) {
    const overrides = structuredClone(Object.assign({}, this.config, options));
    return `${overrides.protocol}://${overrides.host}:${overrides.port}${overrides.prefix}/${overrides.apiVersion}`;
  }

  get baseURL() {
    return this.makeURL();
  }

  getInstance() {
    return this.instance;
  }

  get interceptors() {
    return this.instance.interceptors;
  }

  get defaults() {
    return this.instance.defaults;
  }

  // ======= RAW HTTP REQUESTS =======
  get<T = unknown>(
    url: string,
    params?: unknown,
    config?: Omit<AxiosRequestConfig, "params" | "url">
  ) {
    return this.instance.get<T>(url, { ...config, params });
  }

  post<T>(
    url: string,
    body?: unknown,
    query?: unknown,
    config?: AxiosRequestConfig
  ) {
    return this.instance
      .post<T>(url, body, { ...config, params: query })
      .then((response): Response<T> => {
        const rawHeaders = response.headers;
        return {
          data: response.data,
          headers: Object.assign({}, rawHeaders as unknown),
          requestId: rawHeaders["x-request-id"],
          statusCode: response.status,
          apiVersion: this.config.apiVersion,
        };
      });
  }

  put<T>(
    url: string,
    body?: unknown,
    query?: unknown,
    config?: AxiosRequestConfig
  ) {
    return this.instance
      .put<T>(url, body, { ...config, params: query })
      .then((response): Response<T> => {
        const rawHeaders = response.headers;
        return {
          data: response.data,
          headers: Object.assign({}, rawHeaders as unknown),
          requestId: rawHeaders["x-request-id"],
          statusCode: response.status,
          apiVersion: this.config.apiVersion,
        };
      });
  }

  patch<T>(
    url: string,
    body?: unknown,
    query?: unknown,
    config?: AxiosRequestConfig
  ) {
    return this.instance
      .patch<T>(url, body, { ...config, params: query })
      .then((response): Response<T> => {
        const rawHeaders = response.headers;
        return {
          data: response.data,
          headers: Object.assign({}, rawHeaders as unknown),
          requestId: rawHeaders["x-request-id"],
          statusCode: response.status,
          apiVersion: this.config.apiVersion,
        };
      });
  }

  delete<T>(url: string, query?: unknown, config?: AxiosRequestConfig) {
    return this.instance
      .delete<T>(url, { ...config, params: query })
      .then((response): Response<T> => {
        const rawHeaders = response.headers;
        return {
          data: response.data,
          headers: Object.assign({}, rawHeaders as unknown),
          requestId: rawHeaders["x-request-id"],
          statusCode: response.status,
          apiVersion: this.config.apiVersion,
        };
      });
  }

  // ======================= STATIC =======================
  private static staticAPI: Api = new Api({ port: 80 });
  static interceptors = Api.staticAPI.instance.interceptors;
  static defaults = Api.staticAPI.instance.defaults;
  static baseURL = Api.staticAPI.baseURL;
  static getInstance = Api.staticAPI.getInstance.bind(Api.staticAPI);
  static get = Api.staticAPI.get.bind(Api.staticAPI);
  static post = Api.staticAPI.post.bind(Api.staticAPI);
  static put = Api.staticAPI.put.bind(Api.staticAPI);
  static patch = Api.staticAPI.patch.bind(Api.staticAPI);
  static delete = Api.staticAPI.delete.bind(Api.staticAPI);
}

export default Api;
