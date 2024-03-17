import devServer from "@hono/vite-dev-server";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "bun";
export default defineConfig(({ mode }) => {
	return {
		server: {
			host: "0.0.0.0",
			port: 8080,
			proxy: {
				"/api": {
					target: "http://localhost:3000",
					changeOrigin: false,
				},
				"/api/yws": {
					target: "ws://localhost:3000",
					changeOrigin: false,
					ws: true,
					//rewrite: (path) => path.replace(/^\/yws/, ""),
				},
			},
		},
		plugins: [
			react(),
			TanStackRouterVite({
				
			}),
			tsconfigPaths(),
			VitePWA({
				devOptions:{
					enabled:true
				},
				registerType: "autoUpdate",
				includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png", "maskable-icon-512x512.png"],
				manifest: {
					name: "Axcel Web",
					short_name: "Axcel",
					description: "Axcel Web",
					theme_color:"#ffffff",
					icons: [
						{
							src: "pwa-64x64.png",
							sizes: "64x64",
							type: "image/png"
						},
						{
							src: "pwa-192x192.png",
							sizes: "192x192",
							type: "image/png"
						},
						{
							src: "pwa-512x512.png",
							sizes: "512x512",
							type: "image/png"
						},
						{
							src: "maskable-icon-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "maskable"
						}
					]
				},
			}),
		],
	};
});
