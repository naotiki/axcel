import { never } from "zod";
import { GuardGenerator } from "../../../library/guard/GuardGenerator";
import { GuardModelInfer, GuardModel, GuardModelColumn, GuardSchema } from "../../../library/guard/GuardModel";
import { autoIncrement } from "../../../library/guard/ValueProviders";

const g = new GuardGenerator();

export type AbsoluteCellPosition<T extends GuardModel<string, GuardSchema<string>>,S extends string = never> = {
	id: string;
	column: GuardModelColumn<T> | S;
};
export const mockModel = g.model("Movie", {
	id: g.int().id().default(autoIncrement).label("ID").clientReadonly(),
	title: g.string().label("タイトル"),
	status: g.enum("Status", ["Ok", "Limited", "Suspended"]).label("ステータス").enumLabels({
		Ok: "公開",
		Limited: "限定",
		Suspended: "停止",
	}),
	category: g.string().label("カテゴリー"),
});
export type MockModel = GuardModelInfer<typeof mockModel>;
export const mockDatas: MockModel[] = [
	{
		id: 1,
		title: "てすとすと",
		status: "Ok",
		category: "fun",
	},
	{
		id: 2,
		title: "てすとすと2",
		status: "Limited",
		category: "funny",
	},
	{
		id: 3,
		title: "てすとすと3",
		status: "Suspended",
		category: "funniest",
	},
	{
		id: 4,
		title: "てすとすと4",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 5,
		title: "てすとすと5",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 6,
		title: "てすとすと6",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 7,
		title: "てすとすと7",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 8,
		title: "てすとすと8",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 9,
		title: "てすとすと9",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 10,
		title: "てすとすと10",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 11,
		title: "てすとすと11",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 12,
		title: "てすとすと12",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 13,
		title: "てすとすと13",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 14,
		title: "てすとすと14",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 15,
		title: "てすとすと15",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 16,
		title: "てすとすと16",
		status: "Ok",
		category: "funniest",
	},
	{
		id: 17,
		title: "てすとすと17",
		status: "Suspended",
		category: "funniest",
	},
];

export const creator = g.model("Creator", {
	id: g.int().id().default(autoIncrement).label("ID").clientReadonly(),
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

export const language = g.model("Language", {
	id: g.int().id().default(autoIncrement).label("ID").clientReadonly(),
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
