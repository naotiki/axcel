import devServer from "@hono/vite-dev-server";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
		plugins: [
			devServer({
				entry: "./src/index.tsx",
			}),
		],
	};
});
