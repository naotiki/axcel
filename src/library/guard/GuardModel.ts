import { PrismaClient } from "@prisma/client";
import { GuardHasDefault, GuardOptional, GuardValue } from "./GuardValue";
import { GuardField, GuardRelation, GuardRelationList } from "./guard";
import { FluentOperation } from "@prisma/client/runtime/library";


export class GuardModel<T extends string, S extends GuardSchema<T>> {
	name: string;
	modelSchema: S;
	constructor(name: string, schema: S) {
		this.name = name;
		this.modelSchema = schema;
		this.check();
	}
	check() {
		for (const key in this.modelSchema) {
			if(key.startsWith("__")) throw new Error(`GuardSchemaError: ${this.name}.${key} ---\n\tField name can not start with "__"`);
			const f = this.modelSchema[key];
			if (f instanceof GuardValue) {
				const err = f.checkDef();
				if (err && err.length > 0) {
					throw new Error(`GuardSchemaError: ${this.name}.${key} ---\n\t* ${err.join("\n\t* ")}`);
				}
			}
		}
	}
	//完全識別用IDを付与
	injectId(value: GuardModelOutput<GuardModel<T, S>>) {
		return {
			__id: Object.fromEntries(Object.entries(this.modelSchema)
			.filter(([k, v]) => v instanceof GuardValue && v._id)
			.map(([k, v]) => [k,value[k as keyof typeof value]])) as GuardModelSelector<this>,
			data: {
				...value,
			},
		};
	}
	injectIdList(values: GuardModelOutput<GuardModel<T, S>>[]) {
		return values.map((v) => this.injectId(v));
	}
}



export type GuardModelSelector<T extends GuardModel<string, GuardSchema<string>>> = {
	[K in keyof GuardModelOutput<T>]?:  GuardModelOutput<T>[K];
}&{
	__newuuid?:string
};

export type GuardSchema<T extends string = string> = { [_ in T]: GuardField };

export type GuardModelBase = GuardModel<string, GuardSchema<string>>;

export type GuardModelColumn<T extends GuardModelBase> = T extends GuardModel<string, infer S>
	? keyof S
	: never;

export type GuardModelOutput<T extends GuardModelBase> = T extends GuardModel<string, infer S>
	? GuardSchemaOutput<S>
	: never;
export type GuardModelInput<T extends GuardModelBase> = T extends GuardModel<string, infer S>
	? GuardSchemaInput<S>
	: never;

export type GuardRelationRef<
	T extends GuardRelation<string, GuardSchema> | GuardRelationList<string, GuardSchema>,
> = T extends GuardRelation<string, infer S>
	? {
			ref: {
				[K in keyof T["fields"]]: GuardFieldInfer<T["fields"][K]>;
			};
			value?: GuardSchemaOutput<S>;
	  }
	: T extends GuardRelationList<string, infer S>
	  ? {
				ref: {
					[K in keyof S]?: GuardFieldInfer<S[K]>;
				};
				value?: GuardSchemaOutput<S>;
		  }[]
	  : never;

/* export type GuardRelationRef<S extends GuardSchema> = {
	_id: string;
	value: GuardSchemaOutput<S>;
}; */

type GuardSchemaOutput<S extends GuardSchema> = {
	[K in OptionalGuardFields<S>]: GuardFieldInfer<S[K]> | null;
} & {
	[K in Exclude<keyof S, OptionalGuardFields<S>>]: GuardFieldInfer<S[K]>;
};

type GuardSchemaInput<S extends GuardSchema> = {
	[K in OptionalGuardFields<S>]: GuardFieldInfer<S[K]> | null;
} & {
	[K in HasDefaultGuardFields<S>]?: GuardFieldInfer<S[K]> | undefined;
} & {
	[K in Exclude<keyof S, OptionalGuardFields<S> | HasDefaultGuardFields<S>>]: GuardFieldInfer<S[K]>;
};

type OptionalGuardFields<S extends GuardSchema> = {
	[K in keyof S]: S[K] extends GuardOptional ? K : never;
}[keyof S];

type HasDefaultGuardFields<S extends GuardSchema> = {
	[K in keyof S]: S[K] extends GuardHasDefault<unknown> ? K : never;
}[keyof S];

export type GuardFieldInfer<T extends GuardField> = T extends GuardValue<infer I>
	? I
	: T extends GuardRelation<string, GuardSchema> | GuardRelationList<string, GuardSchema>
	  ? GuardRelationRef<T>
	  : never;
