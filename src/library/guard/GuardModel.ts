import { GuardValue } from "./GuardValue";
import { GuardField } from "./guard";

export class GuardModel<T extends string> {
	name: string;
	modelSchema: Record<T, GuardField>;
	constructor(
		name: string,
		schema: Record<T, GuardField>,
	) {
		this.name = name;
		this.modelSchema = schema;
	}
	check(){
		for(const key in this.modelSchema){
			const f=this.modelSchema[key]
			if (f instanceof GuardValue) {
				const err=f.checkDef();
				if(err&&err.length>0){
					throw new Error(`GuardSchemaError: ${this.name}.${key} ---\n\t* ${err.join("\n\t* ")}`)
				}
			}
		}
	}
}
