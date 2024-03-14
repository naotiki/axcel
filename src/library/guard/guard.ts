import { DefaultValueProvider } from "./ValueProviders";
import { GuardModel, GuardSchema } from "./GuardModel";
import { GuardValue } from "./GuardValue";
import { WithAttributes } from "./WithAttributes";

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
export type GuardField = GuardValueAny | GuardRelation<string,GuardSchema<string>> | GuardRelationList<string,GuardSchema<string>>;
export class GuardRelation<T extends string,S extends GuardSchema<T>> extends WithAttributes{
	model: GuardModel<T, S>;
	fields: Record<string, GuardValueAny>;
	relations: T[];
	constructor(
		model: GuardModel<T, S>,
		fields: Record<string, GuardValueAny>,
		relations: T[],
	) {
		super();
		this.model = model;
		this.fields = fields;
		this.relations = relations;
	}
}
export class GuardRelationList<T extends string,S extends GuardSchema<T>> extends WithAttributes{
	model: GuardModel<T, S>;
	constructor(model: GuardModel<T, S>) {
		super();
		this.model = model;
	}
}

export type DefaultValue<T extends GuardValueAny> = T extends GuardValue<infer E>
	? DefaultValueProvider<T> | E
	: never;
