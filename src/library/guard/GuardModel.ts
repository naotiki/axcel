import { GuardValue } from "./GuardValue";
import { GuardField } from "./guard";

export class GuardModel<T extends string, S extends { [A in T]: GuardField }> {
	name: string;
	modelSchema: S;
	constructor(name: string, schema: S) {
		this.name = name;
		this.modelSchema = schema;
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
}

export type GuardInfer<T extends GuardModel<string, { [A in string]: GuardField }>> = T extends GuardModel<
	string,
	infer S
>
	? { [K in keyof S]: GuardFieldInfer<S[K]> }
	: never;

export type GuardFieldInfer<T extends GuardField> = T extends GuardValue<infer I> ? I : T;
