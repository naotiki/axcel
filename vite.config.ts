import devServer from "@hono/vite-dev-server";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig(({ mode }) => {
	return {
		server: {
			host: "0.0.0.0",
			port: 8080,
			proxy:{
				"/api": {
					target:"http://localhost:3000",
					changeOrigin: false,
				},
				'/yws': {
					target: 'ws://localhost:1234',
					changeOrigin: false,
					ws: true,
					rewrite: (path) => path.replace(/^\/yws/, ''),
				},
			}
		},
		plugins: [react(), TanStackRouterVite(), tsconfigPaths()],
	};
});
