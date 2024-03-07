import { GuardValue } from "./GuardValue";
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
	injectId(value: GuardModelInfer<GuardModel<T, S>>) {
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
	injectIdList(values: GuardModelInfer<GuardModel<T, S>>[]) {
		return values.map((v) => this.injectId(v));
	}
}

export type GuardSchema<T extends string> = { [A in T]: GuardField };

export type GuardModelColumn<T extends GuardModel<string, GuardSchema<string>>> = T extends GuardModel<
	string,
	infer S
>
	? keyof S
	: never;

export type GuardModelInfer<T extends GuardModel<string, GuardSchema<string>>> = T extends GuardModel<
	string,
	infer S
>
	? GuardSchemaInfer<S>
	: never;

export type GuardRelationRef<S extends GuardSchema<string>> = {
	_id: string;
	value: GuardSchemaInfer<S>;
};

type GuardSchemaInfer<S extends GuardSchema<string>> = { [K in keyof S]: GuardFieldInfer<S[K]> };

export type GuardFieldInfer<T extends GuardField> = T extends GuardValue<infer I>
	? I
	: T extends GuardRelation<string, infer S>
	  ? GuardRelationRef<S>
	  : T extends GuardRelationList<string, infer S>
		  ? GuardRelationRef<S>[]
		  : never;

