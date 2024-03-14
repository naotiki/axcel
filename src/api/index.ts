import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authHandler, verifyAuth } from "@hono/auth-js";
import * as Y from "yjs";
import a from "@/front/components/Table/TableDevTest";
import { Prisma, PrismaClient } from "@prisma/client";
import { GuardModelColumn, GuardModelOutput } from "@/library/guard/GuardModel";
import { WebsocketProvider } from "y-websocket";
import { TableChangesRepository } from "@/front/repo/TableChangesRepository";
import { Operation } from "@prisma/client/runtime/library";
import { GuardValue } from "@/library/guard/GuardValue";
import { GuardBool } from "@/library/guard/values/GuardBool";
import { GuardNumbers } from "@/library/guard/values/GuardNumbers";
const api = new Hono();

api.use("/auth/*", authHandler());

api.use("/*", verifyAuth());

api.get("/clock", (c) => {
	return c.json({
		time: new Date().toLocaleTimeString(),
	});
});

const prisma = new PrismaClient();
const axcelPost = api.post(
	"/axcel/:model",
	zValidator(
		"param",
		z.object({
			model: z.string(),
		}),
	),
	async (c) => {
		const { model: modelName } = c.req.valid("param");
		const model = a.models.find((m) => m.name === modelName);
		if (!model) {
			return c.json({ success: false, error: "model not found" }, 404);
		}
		const doc = new Y.Doc();
		const wsProvider = new WebsocketProvider("ws://localhost:8080/yws", modelName, doc, {
			WebSocketPolyfill: WebSocket,
		});
		wsProvider.connect();
		const waitYSync = () =>
			new Promise((res, rej) => {
				wsProvider.once("sync", (isSynced: boolean) => {
					if (isSynced) {
						res(true);
					} else {
						rej(false);
					}
				});
			});
		await waitYSync();
		const tableChangesRepo = new TableChangesRepository(doc);
		tableChangesRepo.setMetaData("locked", true);
		const finalize = async () => {
			tableChangesRepo.setMetaData("locked", false);
			await waitYSync();
			wsProvider.destroy();
		};
		const changes = tableChangesRepo.getState();
		//検証
		for (const [key, field] of Object.entries(model.modelSchema)) {
			const strings = Object.entries(changes.addtions)
				.map(([_, v]) => v[key as keyof typeof model.modelSchema])
				.concat(
					Object.values(changes.changes)
						.filter((v) => v.column === key)
						.map((v) => v.new),
				);
			for (const value of strings) {
				if (field instanceof GuardValue && field.validate(value)) {
					finalize();
					return c.json({ success: false, error: "validation error" }, 400);
				}
				//クソデカTODO リレーション/リレーション[]の検証
			}
		}
		const trans = (key: GuardModelColumn<typeof model>, str: string | undefined | null) => {
			const field = model.modelSchema[key];
			if (str === undefined || str === null) return str;
			if (field instanceof GuardBool) {
				return Boolean(str.toLowerCase() === "true");
			}
			if (field instanceof GuardNumbers) {
				return Number(str);
			}
			return str;
		};

		try {
			//無理やり
			const modelClient = prisma[modelName as keyof PrismaClient] as unknown as {
				[A in Operation]: (...args: unknown[]) => Prisma.PrismaPromise<unknown>;
			};

			const additionals = Object.values(changes.addtions).map((a) =>
				Object.fromEntries(Object.entries(a).map(([k, v]) => [k, trans(k, v)])),
			);
			const updates = Object.values(changes.changes).map((c) => ({
				where: { ...c.__id },
				data: {
					[c.column]: trans(c.column, c.new),
				},
			}));
			const deletions = changes.deletions.map((d) => ({ where: d }));
			const result = await await prisma.$transaction([
				modelClient.createMany({ data: additionals }),
				...updates.map((u) => modelClient.update(u)),
				...deletions.map((d) => modelClient.delete(d)),
			]);
			tableChangesRepo.addtions.clear();
			tableChangesRepo.changes.clear();
			tableChangesRepo.deletions.delete(0, tableChangesRepo.deletions.length);
		} catch (e: unknown) {
			console.dir(e);
			finalize();
			return c.json({ success: false, error: JSON.stringify(e) }, 500);
		}
		tableChangesRepo.setMetaData("updatedAt", Date.now());
		finalize();
		return c.json({ success: true });
	},
);

const axcelGet = api.get(
	"/axcel/:model",
	zValidator(
		"param",
		z.object({
			model: z.string(),
		}),
	),
	async (c) => {
		const { model: modelName } = c.req.valid("param");
		const model = a.models.find((m) => m.name === modelName);
		if (!model) {
			return c.json({ success: false, error: "model not found" }, 404);
		}
		try {
			//無理やり
			const modelClient = prisma[modelName as keyof PrismaClient] as unknown as {
				[A in Operation]: (...args: unknown[]) => Prisma.PrismaPromise<unknown>;
			};
			const order = Object.fromEntries(model.getIdEntries().map(([k]) => [k, "asc"]));

			const result = (await modelClient.findMany({
				orderBy: order,
			})) as GuardModelOutput<typeof model>[];
			return c.json(result);
		} catch (e: unknown) {
			console.dir(e);
			return c.json({ success: false, error: JSON.stringify(e) }, 500);
		}
	},
);

export type AxcelPost = typeof axcelPost;
export type AxcelGet = typeof axcelGet;






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
