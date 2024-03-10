import { GuardValue } from "../GuardValue";
import { PrismaType } from "../guard";

abstract class GuardNumbers extends GuardValue<number> {
	minValue?: number;
	maxValue?: number;
	constructor(type: PrismaType) {
		super(type, true);
	}
	min(min: number) {
		this.minValue = min;
		return this;
	}
	max(max: number) {
		this.maxValue = max;
		return this;
	}
	range(min: number, max: number) {
		this.minValue = min;
		this.maxValue = max;
		return this;
	}
	override validator(value: string): string[] | undefined {
		const n = Number(value);
		if (value === "" || Number.isNaN(n)) {
			return ["数値である必要があります。"];
		}
		if (this.minValue && this.maxValue && (n < this.minValue || n > this.maxValue)) {
			return [`範囲外の数値です。${this.minValue}以上${this.maxValue}以下である必要があります。`];
		}
		if (this.minValue && n < this.minValue) {
			return [`${this.minValue}以上である必要があります。`];
		}
		if (this.maxValue && n > this.maxValue) {
			return [`${this.maxValue}以下である必要があります。`];
		}
	}
	override defValidate(err: string[]) {
		if (this.minValue && this.maxValue && this.minValue > this.maxValue) {
			err.push("minValue must be less than or equal to maxValue");
		}
	}
}
export class GuardInt extends GuardNumbers {
	constructor() {
		super(PrismaType.Int);
	}
	override validator(value: string): string[] | undefined {
		const err = super.validator(value);
		const n = Number(value);
		if (!Number.isInteger(n)) {
			err?.push("整数である必要があります。");
			return err ?? ["整数である必要があります。"];
		}
	}
}
export class GuardFloat extends GuardNumbers {
	constructor() {
		super(PrismaType.Float);
	}
}
export class GuardDecimal extends GuardNumbers {
	constructor() {
		super(PrismaType.Decimal);
	}
}
