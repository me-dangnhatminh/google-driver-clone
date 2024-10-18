import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()));
  return {
    mode,
    plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
    server: {
      host: true,
      watch: { usePolling: true },
      strictPort: true,
      port: 5173,
    },
  };
});
