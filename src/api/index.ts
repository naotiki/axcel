import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authHandler, verifyAuth } from "@hono/auth-js";
import * as Y from "yjs";
import { Prisma, PrismaClient } from "@prisma/client";
import {
	GuardModelBase,
	GuardModelColumn,
	GuardModelOutput,
	GuardRelationRefAny,
	GuardSchema,
} from "@/library/guard/GuardModel";
import { WebsocketProvider } from "y-websocket";
import { TableChangesRepository } from "@/front/repo/TableChangesRepository";
import { Operation } from "@prisma/client/runtime/library";
import { GuardValue } from "@/library/guard/GuardValue";
import { GuardBool } from "@/library/guard/values/GuardBool";
import { GuardNumbers } from "@/library/guard/values/GuardNumbers";
import { GuardRelation } from "@/library/guard/guard";
import { GuardDateTime } from "@/library/guard/values/GuardDateTime";
import { objectEntriesMap } from "@/utils/objectUtils";
import { createBunWebSocket } from "hono/bun";
import { upgradeWebSocket } from "..";
import { axcel } from "@/axcelExport";
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
		const model = axcel.models.find((m) => m.name === modelName);
		if (!model) {
			return c.json({ success: false, error: "model not found" }, 404);
		}
		const doc = new Y.Doc();
		const wsProvider = new WebsocketProvider("ws://localhost:1234", modelName, doc, {
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
		const trans = <T extends GuardModelBase>(
			key: GuardModelColumn<T>,
			str: GuardRelationRefAny | string | undefined | null,
			m?: T,
		) => {
			const field = (m ?? model).modelSchema[key];
			if (str === undefined || str === null) return [key, str];
			if (field instanceof GuardRelation) {
				//return
				const v = str as GuardRelationRefAny;
				return Object.keys(field.fields).map((k, i) => [k, v.ref[field.relations[i]]])[0];
				/* {
					connect: Object.fromEntries(
						Object.entries((str as GuardRelationRefAny).ref).map(([k, v]) => [k, trans(k, v,field.model)]),
					),
				}; */
			}
			if (field instanceof GuardBool) {
				return [key, Boolean(str.toLowerCase() === "true")];
			}
			if (field instanceof GuardNumbers) {
				return [key, Number(str)];
			}
			if (field instanceof GuardDateTime) {
				return [key, new Date(Date.parse(str))];
			}
			return [key, str];
		};
		try {
			//無理やり
			const modelClient = prisma[modelName as keyof PrismaClient] as unknown as {
				[A in Operation]: (...args: unknown[]) => Prisma.PrismaPromise<unknown>;
			};

			const additionals = Object.values(changes.addtions).map((a) =>
				Object.fromEntries(Object.entries(a).map(([k, v]) => trans(k, v))),
			);
			const updates = Object.values(changes.changes).map((c) => {
				return {
					where: { ...c.__id },
					data: Object.fromEntries([trans(c.column, c.new)]),
				};
			});
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
	zValidator("query", z.any().optional()),
	async (c) => {
		const { model: modelName } = c.req.valid("param");
		const sort = c.req.valid("query");
		const model = axcel.models.find((m) => m.name === modelName);
		if (!model) {
			return c.json({ success: false, error: "model not found" }, 404);
		}
		try {
			//無理やり
			const modelClient = prisma[modelName as keyof PrismaClient] as unknown as {
				[A in Operation]: (...args: unknown[]) => Prisma.PrismaPromise<unknown>;
			};
			const order = sort || Object.fromEntries(model.getIdEntries().map(([k]) => [k, "asc"]));

			const result = (await modelClient.findMany({
				orderBy: Object.entries(order).map(([k, v]) => ({ [k]: v })),
				include: Object.values(model.modelSchema).some((v) => v instanceof GuardRelation)
					? Object.fromEntries(
							Object.entries(model.modelSchema)
								.filter(([, v]) => v instanceof GuardRelation)
								.map(([k]) => [k, true]),
					  )
					: undefined,
			})) as GuardModelOutput<typeof model>[];

			return c.json(
				result.map((r) =>
					objectEntriesMap(r, (k: string, v) => {
						const relation = Object.entries(model.modelSchema).find(
							([, f]) => f instanceof GuardRelation && f.fields[k],
						);
						const rData = Object.entries(model.modelSchema).find(
							([k2, f]) => f instanceof GuardRelation && k2 === k,
						);
						return relation
							? [
									relation[0],
									{
										ref: Object.fromEntries(
											(relation[1] as GuardRelation<string, GuardSchema>).model
												.getIdEntries()
												.map(([k2]) => [k2, v]),
										),
										value: r[relation[0]],
									} as GuardRelationRefAny,
							  ]
							: rData
							  ? []
							  : [k, v];
					}),
				),
			);
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
