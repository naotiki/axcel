import devServer from "@hono/vite-dev-server";
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
		server: {
			port: 3000,
		},
		ssr: {
			external: ["react", "react-dom"],
		},
		plugins: [
			devServer({
				entry: "src/index.tsx",
			}),
		],
	};
});
