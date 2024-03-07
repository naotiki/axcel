import { DefaultValueProvider } from "./ValueProviders";
import { GuardModel } from "./GuardModel";
import { GuardValue } from "./GuardValue";

export enum PrismaType {
	String = "String",
	Boolean = "Boolean",
	Int = "Int",
	BigInt = "BigInt",
	Float = "Float",
	Decimal = "Decimal",
	DateTime = "DateTime",
	Enum = "Enum",
	List = "List",
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type GuardValueAny = GuardValue<any>;
export type GuardField = GuardValueAny | GuardRelation<string> | GuardRelationList<string>;
export class GuardRelation<T extends string> {
	model: GuardModel<T, { [A in T]: GuardField }>;
	fields: Record<string, GuardValueAny>;
	relations: T[];
	constructor(
		model: GuardModel<T, { [A in T]: GuardField }>,
		fields: Record<string, GuardValueAny>,
		relations: T[],
	) {
		this.model = model;
		this.fields = fields;
		this.relations = relations;
	}
}
export class GuardRelationList<T extends string> {
	model: GuardModel<T, { [A in T]: GuardField }>;
	constructor(model: GuardModel<T, { [A in T]: GuardField }>) {
		this.model = model;
	}
}

export type DefaultValue<T extends GuardValueAny> = T extends GuardValue<infer E>
	? DefaultValueProvider<T> | E
	: never;
