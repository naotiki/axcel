import { Hono } from "hono";
import { renderToString } from "react-dom/server";
import api from "./api/index";
import { initAuthConfig } from "@hono/auth-js";
import Keycloak from "@auth/core/providers/keycloak";
const app = new Hono();
app.use(
	"*",
	initAuthConfig((c) => {
		c.res.headers.set("x-forwarded-host", process.env.AUTH_URL??"");
		//c.res.headers["x-forwarded-host"] = process.env.AUTH_URL
		return ({
			secret: process.env.AUTH_SECRET,
			providers: [
				Keycloak({
					clientId: process.env.KEYCLOAK_CLIENT_ID,
					clientSecret: process.env.KEYCLOAK_SECRET,
					issuer: process.env.KEYCLOAK_ISSUER,
				}),
			],
		})
	}),
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
export default  app
