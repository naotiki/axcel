import { DefaultValueProvider } from "./ValueProviders";
import { GuardModel } from "./GuardModel";
import { GuardValue } from "./GuardValue";

export enum PrismaType {
	String = "String",
	Boolean = "Boolean",
	Int = "Int",
	BigInt = "BigInt",
	Float = "Float",
	Decimal = 		"Decimal",
	DateTime = "DateTime",
	Enum = "Enum",
	List = "List",
}

/*type SaferType<P extends PrismaType> = {
	prismaType: P;
};*/

//type SaferString = SaferType<PrismaType.String>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type GuardValueAny = GuardValue<any>;
export type GuardField = GuardValueAny | GuardRelation<string> | GuardRelationList<string>;
export class GuardRelation<T extends string> {
	model: GuardModel<T>;
	fields: Record<string, GuardValueAny>;
	relations: T[];
	constructor(model: GuardModel<T>, fields: Record<string, GuardValueAny>, relations: T[]) {
		this.model = model;
		this.fields = fields;
		this.relations = relations;
	}
}
export class GuardRelationList<T extends string> {
	model: GuardModel<T>;
	constructor(model: GuardModel<T>) {
		this.model = model;
	}
}

export type DefaultValue<T extends GuardValueAny> = T extends GuardValue<infer E>
	? DefaultValueProvider<T> | E
	: never;
