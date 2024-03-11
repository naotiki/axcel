import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authHandler, verifyAuth } from "@hono/auth-js";
import { gValidator as gCreateValidator } from "@/library/guard/hono/gValidator";
import { label, project } from "@/library/test/gionsai";
import { hc } from "hono/client";
import { language, mockModel } from "@/front/components/Table/TableDevTest";
import { PrismaClient } from "@prisma/client";
import { GuardModelOutput } from "@/library/guard/GuardModel";
const api = new Hono();

api.use("/auth/*", authHandler());

api.use("/*", verifyAuth());

api.get("/clock", (c) => {
	return c.json({
		time: new Date().toLocaleTimeString(),
	});
});

const prisma = new PrismaClient();

const createMock = api.post("/mock", gCreateValidator(mockModel), async (c) => {
	const result: GuardModelOutput<typeof mockModel> = await prisma.movie.create({
		data: {
			number
			
		},
	});
	return c.json(result);
});

const getAllMock = api.get("/mock",  async (c) => {
	const result: GuardModelOutput<typeof mockModel>[] = await prisma.movie.findMany();
	return c.json(result);
});

export type ApiMock = typeof createMock;




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
