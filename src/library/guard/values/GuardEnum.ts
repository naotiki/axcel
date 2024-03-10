import { GuardValue } from "../GuardValue";
import {  PrismaType } from "../guard";

export class GuardEnum<T extends string> extends GuardValue<T> {
	validator(value: string): string[] | undefined {
		
		if(!(this.enumValues.includes(value as T))){
			return ["不正な値です。"]
		}
	}
	name: string;
	enumValues: [T, ...T[]];

	constructor(name: string, enumValues: [T, ...T[]]) {
		super(PrismaType.Enum);
		this.name = name;
		this.enumValues = enumValues;
	}
	_enumLabels:Partial<Record<T, string>>={};
	enumLabels(labels: Record<T, string>) {
		this._enumLabels=labels;
		return this;
	}
	override defValidate(err:string[]) {
		if (this.enumValues.length === 0) {
			err.push("enumValues size must be larger than zero");
		}
	}
}
