import { GuardValue, GuardHasDefault } from "../GuardValue";
import { PrismaType } from "../guard";

export class GuardDateTime extends GuardValue<Date> {
	validator(value: string): string[] | undefined {
		if (Number.isNaN(Date.parse(value))) {
			return ["日時が不正です。"];
		}
	}
	_updatedAt?: boolean;
	isDateOnly?: boolean;
	constructor() {
		super("日時", PrismaType.DateTime, false);
	}
	dateOnly() {
		this.isDateOnly = true;
		return this;
	}
	updatedAt() {
		this._updatedAt = true;
		return this.default({
			expression: "updatedAt",
		}) as this & GuardHasDefault<Date>;
	}
	override defValidate(_err: string[]) {
		return;
	}
}
