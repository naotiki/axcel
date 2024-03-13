import { never } from "zod";
import { GuardGenerator } from "../../../library/guard/GuardGenerator";
import { GuardModelOutput, GuardModel, GuardModelColumn, GuardSchema } from "../../../library/guard/GuardModel";
import { autoIncrement } from "../../../library/guard/ValueProviders";

const g = new GuardGenerator();

export type AbsoluteCellPosition<T extends GuardModel<string, GuardSchema<string>>,S extends string = never> = {
	id: string;
	column: GuardModelColumn<T> | S;
};



export const mockModel = g.model("movie", {
	id: g.int().id().default(autoIncrement).label("ID").axcelReadonly(),
	title: g.string().label("タイトル").min(1),
	status: g.enum("Status", ["Ok", "Limited", "Suspended"]).label("ステータス").enumLabels({
		Ok: "公開",
		Limited: "限定",
		Suspended: "停止",
	}),
	category: g.string().label("カテゴリー"),
	check: g.bool().label("チェック").optional(),
	number: g.int().label("数値").optional().default(1),
});
export type MockModel = GuardModelOutput<typeof mockModel>;
export const mockDatas: MockModel[] = [
	{
		id: 1,
		title: "てすとすと",
		status: "Ok",
		category: "fun",
		check: true,
		number: 2,
	},
	{
		id: 2,
		title: "てすとすと2",
		status: "Limited",
		category: "funny",
		check: false,
		number:null
	},
	{
		id: 3,
		title: "てすとすと3",
		status: "Suspended",
		category: "funniest",
		check:null,
		number: 0,
	},
	{
		id: 4,
		title: "てすとすと4",
		status: "Ok",
		category: "funniest",
		check:null,
		number: null,
	},
	{
		id: 5,
		title: "てすとすと5",
		status: "Ok",
		category: "funniest",
		check:false,
		number: 5,
	},

];

export const creator = g.model("creator", {
	id: g.int().id().default(autoIncrement).label("ID").axcelReadonly(),
	name: g.string().label("名前"),
	country: g.string().label("国"),
	website: g
		.string()
		.label("サイトURL")
		.regex({
			regex: /^https?:\/\/.+/,
			regexName: "URL",
			hint: "http://かhttps://から始まるURLを入力してください",
		}),
});

export const language = g.model("language", {
	id: g.int().id().default(autoIncrement).label("ID").axcelReadonly(),
	name: g.string().label("名前"),
	firstRelease: g.dateTime().label("初版リリース日").dateOnly(),
	latestVersion: g.string().label("バージョン"),
	latestRelease: g.dateTime().label("最新リリース日").dateOnly(),
	website: g
		.string()
		.label("公式サイトURL")
		.regex({
			regex: /^https?:\/\/.+/,
			regexName: "URL",
			hint: "http://かhttps://から始まるURLを入力してください",
		})
		.optional(),
	creator: g.relation(
		creator,
		{
			creatorId: g.int(),
		},
		["id"],
	),
	funny: g.bool().anotate({ label: "楽しい", description: '関数宣言が"fun"かどうか' }),
});

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
g.prismaHeader(`
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
generator client {
	provider        = "prisma-client-js"
}
`);
export default g;