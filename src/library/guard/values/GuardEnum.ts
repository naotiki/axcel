import { GuardValue } from "../GuardValue";
import {  PrismaType } from "../guard";

export class GuardEnum<T extends string> extends GuardValue<T> {
	name: string;
	enumValues: [T, ...T[]];

	constructor(name: string, enumValues: [T, ...T[]]) {
		super(PrismaType.Enum);
		this.name = name;
		this.enumValues = enumValues;
	}

	override defValidate(err:string[]) {
		if (this.enumValues.length === 0) {
			err.push("enumValues size must be larger than zero");
		}
	}
}
