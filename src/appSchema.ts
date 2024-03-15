import { Axcel } from "./library/guard/GuardGenerator";
import {
	GuardModelOutput,
} from "./library/guard/GuardModel";
import { autoIncrement } from "./library/guard/ValueProviders";

const a = new Axcel();

export const mockModel = a
	.model("movie", {
		id: a.int().id().default(autoIncrement).label("ID").axcelReadonly(),
		title: a.string().label("タイトル").min(1),
		status: a.enum("Status", ["Ok", "Limited", "Suspended"]).label("ステータス").enumLabels({
			Ok: "公開",
			Limited: "限定",
			Suspended: "停止",
		}),
		category: a.string().label("カテゴリー"),
		check: a.bool().label("チェック").optional(),
		number: a.int().label("数値").optional().default(1),
	})
	.label("テスト")
	.desc("テスト用のモデル");
export type MockModel = GuardModelOutput<typeof mockModel>;

export const creator = a.model("creator", {
	id: a.int().id().default(autoIncrement).label("ID").axcelReadonly(),
	name: a.string().label("名前"),
	country: a.string().label("国"),
	website: a
		.string()
		.label("サイトURL")
		.regex({
			regex: /^https?:\/\/.+/,
			regexName: "URL",
			hint: "http://かhttps://から始まるURLを入力してください",
		}),
});

export const language = a.model("language", {
	id: a.int().id().default(autoIncrement).label("ID").axcelReadonly(),
	name: a.string().label("名前"),
	firstRelease: a.dateTime().label("初版リリース日").dateOnly(),
	latestVersion: a.string().label("バージョン"),
	latestRelease: a.dateTime().label("最新リリース日").dateOnly(),
	website: a
		.string()
		.label("公式サイトURL")
		.regex({
			regex: /^https?:\/\/.+/,
			regexName: "URL",
			hint: "http://かhttps://から始まるURLを入力してください",
		})
		.optional(),
	creator: a.relation(
		creator,
		{
			creatorId: a.int(),
		},
		["id"],
	),
	funny: a.bool().anotate({ label: "楽しい", description: '関数宣言が"fun"かどうか' }),
});
type A = GuardModelOutput<typeof language>;
const aa: A = {
	id: 1,
	name: "a",
	firstRelease: new Date(),
	latestVersion: "1.0",
	latestRelease: new Date(),
	website: "",
	creator: {
		ref: {
			id: 1,
		},
	},
	funny: true,
};

/* 
export const mockModel2 = g.model("Movie", {
	id: g.int().id().default(autoIncrement).label("ID").axcelReadonly(),
	title: g.string().label("タイトル"),
	status: g.enum("Status", ["Ok", "Limited", "Suspended"]).label("ステータス").enumLabels({
		Ok: "公開",
		Limited: "限定",
		Suspended: "停止",
	}),
	category: g.string().label("カテゴリー"),
	language: g.relation(
		language,
		{
			languageId: g.int(),
		},
		["id"],
	),
}); */
a.prismaHeader(`
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
generator client {
	provider        = "prisma-client-js"
}
`);
export default a;
