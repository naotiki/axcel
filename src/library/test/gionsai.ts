import { autoIncrement, now } from "../guard/ValueProviders";
import { GuardGenerator } from "../guard/GuardGenerator";
import { GuardInfer } from "../guard/GuardModel";
const g= new GuardGenerator();
const category = g.model("Category", {
	id: g.int().id().default(autoIncrement),
	name: g.string(),
	prefix: g.string().unique(),
});

const label = g.model("Label", {
	id: g.int().id().default(autoIncrement),
	name: g.string(),
});
const location = g.model("Location", {
	id: g.int().id().default(autoIncrement),
	name: g.string(),
});


const group = g.model("Group", {
  id: g.int().id().default(autoIncrement),
  name: g.string(),
  contact: g.string().email(),
});


const member = g.model("Member", {
  id: g.int().id().default(autoIncrement),
  email: g.string().email().unique(),
  alias: g.string(),
  displayName: g.string(),
  role: g.enum("Role", ["Admin", "User"]).default("User"),
  group: g.relationList(group),
  createdAt: g.dateTime().default(now),
  updatedAt: g.dateTime().updatedAt(),
});


export const project = g.model("Project", {
	id: g.int().id().default(autoIncrement),
	title: g.string(),
	status: g.enum("Status", ["Ok", "Limited", "Suspended"]).optional(),
	category: g.relation(
		category,
		{
			categoryId: g.int(),
		},
		["id"],
	),
	label: g.relation(
		label,
		{
			labelId: g.int(),
		},
		["id"],
	),
	location: g.relationList(location),
	description: g.string(),
	alias: g
		.string()
		.unique()
		.regex(/^[A-Z]\-[0-9]{2}$/),
	visible: g.bool(),
	imagePath: g.string().optional(),
  group: g.relation(
		group,
		{
			groupId: g.int(),
		},
		["id"],
	),
	createdAt: g.dateTime().default(now),
	updatedAt: g.dateTime().updatedAt(),
});

g.header(`
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
generator client {
	provider        = "prisma-client-js"
	previewFeatures = ["fullTextSearch"]
}
`);

export default g;
