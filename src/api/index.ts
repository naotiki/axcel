import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authHandler, verifyAuth } from "@hono/auth-js";

const api = new Hono();

api.use("/auth/*", authHandler());

api.use("/*", verifyAuth());

api.get("/clock", (c) => {
	return c.json({
		time: new Date().toLocaleTimeString(),
	});
});

export type TestZodType = typeof zodTest;
const zodTest = api.get(
	"/projects",
	zValidator(
		"json",
		z.object({
			body: z.string(),
		}),
	),
);
export default api;
