import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());
  Object.assign(process.env, env);
  return {
    plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
    server: {
      host: true,
      watch: { usePolling: true },
      port: 4173,
    },
  };
});
