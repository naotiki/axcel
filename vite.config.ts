import devServer from "@hono/vite-dev-server";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig(({ mode }) => {
	if (mode === "client") {
		return {
			build: {
				rollupOptions: {
					input: "./src/client.tsx",
					output: {
						entryFileNames: "static/client.js",
					},
				},
			},
			plugins: [tsconfigPaths()]
		};
	}
	return {
		ssr: {
			external: ["react", "react-dom"],
		},
		server: {
			host:"0.0.0.0",
			port: 3000,
		},
		build: {
			emptyOutDir: false,
		},
		plugins: [TanStackRouterVite(),
			tsconfigPaths(),
			devServer({
				entry: "./src/index.tsx",
			}),
		],
	};
});
