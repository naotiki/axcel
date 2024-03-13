import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { set, z } from "zod";
import { authHandler, verifyAuth } from "@hono/auth-js";
import { gValidator as gCreateValidator, gValidator } from "@/library/guard/hono/gValidator";
import { label, project } from "@/library/test/gionsai";
import { hc } from "hono/client";
import * as Y from "yjs";
import g, { language, mockModel } from "@/front/components/Table/TableDevTest";
import { Prisma, PrismaClient } from "@prisma/client";
import { GuardModelOutput } from "@/library/guard/GuardModel";
import { WebsocketProvider } from "y-websocket";
import { TableChangesRepository } from "@/front/repo/TableChangesRepository";
import { sleep } from "bun";
const api = new Hono();

api.use("/auth/*", authHandler());

api.use("/*", verifyAuth());

api.get("/clock", (c) => {
	return c.json({
		time: new Date().toLocaleTimeString(),
	});
});

const apply = api.post(
	"/axcel/:model",
	zValidator(
		"param",
		z.object({
			model: z.string(),
		}),
	),zValidator(
		"json",
		z.object({
			addition: z.array(z.any())
		}),
	),
	async (c) => {
		const { model: modelName } = c.req.valid("param");
		const model = g.models.find((m) => m.name === modelName);
		if (!model) {
			//return c.json({ success: false, error: "model not found" }, 404);
		}
		const doc = new Y.Doc();
		const wsProvider = new WebsocketProvider("ws://localhost:8080/yws", "test-room" /* modelName */, doc, {
			WebSocketPolyfill: WebSocket,
		});
		wsProvider.connect();
		const tableChangesRepo = new TableChangesRepository(doc);
		tableChangesRepo.setMetaData("locked", true);
		const finalize = async () => {
			tableChangesRepo.setMetaData("locked", false);
			await new Promise((res, rej) => {
				wsProvider.once("sync", (isSynced: boolean) => {
					if (isSynced) {
						res(true);
					} else {
						rej(false);
					}
				});
			});
			wsProvider.destroy();
		};
		tableChangesRepo.getState();
		new PrismaClient().movie.delete({ where: { id: 1 } })



		finalize();
		return c.json({ success: true, error: "model not found" });
	},
);

const prisma = new PrismaClient();

const createMock = api.post("/mock", gCreateValidator(mockModel), async (c) => {
	const result: GuardModelOutput<typeof mockModel> = await prisma.movie.create({
		data: {},
	});
	return c.json(result);
});

const getAllMock = api.get("/mock", async (c) => {
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
