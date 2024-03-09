import { label } from "../test/gionsai";
import { GuardHasDefault, GuardOptional, GuardValue } from "./GuardValue";
import { GuardField, GuardRelation, GuardRelationList } from "./guard";

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
			_id: Object.entries(this.modelSchema)
				.filter(([k, v]) => v instanceof GuardValue && v._id)
				.map(([k, v]) => value[k as keyof typeof value])
				.join("+"),
			data: {
				...value,
			},
		};
	}
	injectIdList(values: GuardModelOutput<GuardModel<T, S>>[]) {
		return values.map((v) => this.injectId(v));
	}
}

export type GuardSchema<T extends string> = { [_ in T]: GuardField };

export type GuardModelColumn<T extends GuardModel<string, GuardSchema<string>>> = T extends GuardModel<
	string,
	infer S
>
	? keyof S
	: never;

export type GuardModelOutput<T extends GuardModel<string, GuardSchema<string>>> = T extends GuardModel<
	string,
	infer S
>
	? GuardSchemaOutput<S>
	: never;
export type GuardModelInput<T extends GuardModel<string, GuardSchema<string>>> = T extends GuardModel<
	string,
	infer S
>
	? GuardSchemaInput<S>
	: never;

export type GuardRelationRef<S extends GuardSchema<string>> = {
	_id: string;
	value: GuardSchemaOutput<S>;
};

type GuardSchemaOutput<S extends GuardSchema<string>> = {
	[K in OptionalGuardFields<S>]?: GuardFieldInfer<S[K]>;
} & {
	[K in Exclude<keyof S, OptionalGuardFields<S>>]: GuardFieldInfer<S[K]>;
};

type GuardSchemaInput<S extends GuardSchema<string>> = {
	[K in OptionalGuardFields<S> | HasDefaultGuardFields<S>]?: GuardFieldInfer<S[K]>;
} & {
	[K in Exclude<keyof S, OptionalGuardFields<S> | HasDefaultGuardFields<S>>]: GuardFieldInfer<S[K]>;
};

type OptionalGuardFields<S extends GuardSchema<string>> = {
	[K in keyof S]: S[K] extends GuardOptional ? K : never;
}[keyof S];

type HasDefaultGuardFields<S extends GuardSchema<string>> = {
	[K in keyof S]: S[K] extends GuardHasDefault<unknown> ? K : never;
}[keyof S];

export type GuardFieldInfer<T extends GuardField> = T extends GuardValue<infer I>
	? I
	: T extends GuardRelation<string, infer S>
	  ? GuardRelationRef<S>
	  : T extends GuardRelationList<string, infer S>
		  ? GuardRelationRef<S>[]
		  : never;
