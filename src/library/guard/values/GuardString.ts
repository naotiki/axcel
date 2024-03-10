import { GuardValue } from "../GuardValue";
import { PrismaType } from "../guard";

type RegExpFilter={
	regex:RegExp;
	regexName?:string;
	hint?:string
}

export class GuardString extends GuardValue<string> {
	validator(value: string): string[] | undefined {	
		const err: string[] = [];
		if (this.minLength && value.length < this.minLength) {
			err.push(`文字数が${this.minLength}文字未満です。`);
		}
		if (this.maxLength && value.length > this.maxLength) {
			err.push(`文字数が${this.maxLength}文字を超えています。`);
		}
		if (this._regex && !this._regex.regex.test(value)) {
			err.push(`${this._regex.regexName??"値"}の形式が正しくありません。${this._regex.hint ?? ""}`);
		}
		return err.length > 0 ? err : undefined;
	}
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
		super(PrismaType.String,true);
	}

	override defValidate(err: string[]) {
		if (this.minLength && this.maxLength && this.minLength > this.maxLength) {
			err.push("minLength must be less than or equal to maxLength");
		}
	}
}
