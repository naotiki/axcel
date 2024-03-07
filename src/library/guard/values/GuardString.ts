import { GuardValue } from "../GuardValue";
import { PrismaType } from "../guard";

type RegExpFilter={
	regex:RegExp;
	regexName?:string;
	hint?:string
}

export class GuardString extends GuardValue<string> {
	minLength?: number;
	maxLength?: number;
	_regex?: RegExpFilter;
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
		this._regex = {
			regex:/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
			regexName:"メールアドレス",
		};
		return this;
	}
	regex(r: RegExp | RegExpFilter) {
		if (r instanceof RegExp) {
			this._regex = {regex:r};
			
		}else{
			this._regex = r;
		}
		return this;
	}
	namedRegex(r:RegExp,name:string){
		this._regex = {regex:r,regexName:name};
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
