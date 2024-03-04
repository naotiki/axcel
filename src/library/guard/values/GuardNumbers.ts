import { GuardValue } from "../GuardValue";
import { PrismaType } from "../guard";

abstract class GuardNumbers extends GuardValue<number> {
	minValue?: number;
	maxValue?: number;
	_regex?: RegExp;
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
