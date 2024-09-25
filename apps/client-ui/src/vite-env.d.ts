/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: "development" | "production" | "test";
  readonly VITE_API_URL: string;
  readonly VITE_REQUEST_TIMEOUT_MS: number;
  readonly VITE_LIVEBLOCKS_SECRET_KEY: string;
  readonly VITE_LIVEKIT_SERVER_URL: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_PRICING_TABLE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
