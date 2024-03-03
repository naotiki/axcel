import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const api = new Hono();
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
