import { Hono } from "hono";
import api from "./api/index";
import { createBunWebSocket } from "hono/bun";
import { authProvider } from "./honoExport";
const app = new Hono();

app.use(
	"*",
	authProvider.initMiddleware(),
);

app.route("/api", api);

/* app.get("/*", (c) => {
	return c.html(
		renderToString(
			<html lang="ja">
				<head>
					<meta charSet="utf-8" />
					<meta content="width=device-width, initial-scale=1" name="viewport" />
					{import.meta.env.PROD ? (
						<script type="module" src="/static/client.js" />
					) : (
						<>
							<script type="module" src="/src/App.tsx" />
						</>
					)}
					<title>Axcel</title>
				</head>
				<body>
					<div id="app" />
				</body>
			</html>,
		),
	);
}); */
export const { upgradeWebSocket, websocket } = createBunWebSocket();
Bun.serve({
	fetch: app.fetch,
	websocket,
});
app.use("/api/yws/**", authProvider.verifyAuthMiddleware());
app.get(
	"/api/yws/**",
	upgradeWebSocket((c) => {
		const path = c.req.path.replace("/api/yws/", "");
		let yWs: WebSocket | undefined = undefined;
		return {
			onOpen(evt, ws) {
				yWs = new WebSocket(`ws://localhost:1234/${path}`);
				yWs.addEventListener("message", (e) => {
					ws.send(e.data);
				});
				yWs.addEventListener("close", () => {
					ws.close();
				});
			},
			onMessage(event, ws) {
				yWs?.send(event.data);
			},
			onClose: (e, ws) => {
				yWs?.close();
			},
		};
	}),
);
//export default app;
