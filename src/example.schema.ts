import { Axcel } from "./library/guard/GuardGenerator";
import { autoIncrement, now } from "./library/guard/ValueProviders";

const a = new Axcel();

const group = a
	.model("group", {
		id: a.int().id().default(autoIncrement).label("ID").axcelReadonly(),
		name: a.string().label("団体名").min(1),
		contact: a.string().email().label("代表者連絡先"),
		createdAt: a.dateTime().label("作成日時").default(now).axcelReadonly(),
		updatedAt: a.dateTime().label("更新日時").updatedAt().axcelReadonly(),
	})
	.label("団体")
	.desc("祇園祭20XXの団体一覧");


	const project = a
	.model("project", {
		//Axcelからの変更不可
		id: a.int().id().default(autoIncrement).label("ID").axcelReadonly(),
		alias: a
			.string()
			.label("エイリアス")
			.unique()
			.regex({
				regex: /^[A-Z]\-[0-9]{2}$/,
				regexName: "エイリアス",
				hint: "Z-99のような形式で入力してください",
			}),
		title: a.string().label("企画名").min(1),
		description: a.string().label("企画説明").optional().max(1000),
		group: a
			.relation(
				group,
				{
					groupId: a.int(),
				},
				["id"],
			)
			.label("団体"),
		status: a
			.enum("Status", ["Ok", "Limited", "Suspended"])
			.label("企画ステータス")
			.desc("企画の受付状態")
			.enumLabels({
				Ok: "受付中",
				Limited: "制限",
				Suspended: "中止",
			}),

		createdAt: a.dateTime().label("作成日時").default(now).axcelReadonly(),
		updatedAt: a.dateTime().label("更新日時").updatedAt().axcelReadonly(),
	})
	.label("企画")
	.desc("祇園祭20XXの企画一覧");



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
