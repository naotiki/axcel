import { GuardValue } from "../GuardValue";
import { PrismaType } from "../guard";

export class GuardString extends GuardValue<string> {
	minLength?: number;
	maxLength?: number;
	_regex?: RegExp;
	min(min: number) {
		this.minLength = min;
		return this;
	}
	max(max: number) {
		this.maxLength = max;
		return this;
	}
	range(min: number, max: number) {
		this.minLength = min;
		this.maxLength = max;
		return this;
	}
	length(len: number) {
		this.minLength = len;
		this.maxLength = len;
		return this;
	}
	email() {
		this._regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		return this;
	}
	regex(r: RegExp) {
		this._regex = r;
		return this;
	}
	constructor() {
		super(PrismaType.String);
	}

	override defValidate(err: string[]) {
		if (this.minLength && this.maxLength && this.minLength > this.maxLength) {
			err.push("minLength must be less than or equal to maxLength");
		}
	}
}
