import { any } from "zod";
import { DefaultValue, PrismaType } from "./guard";

export type GuardValueAnotations = {
	label?: string;
	description?:string;
};

export abstract class GuardValue<T> {
	prismaType: PrismaType;
	_default?: DefaultValue<GuardValue<T>>;
	_id?: boolean;
	_unique?: boolean;
	_optional?: boolean;
	_readonly?: boolean;
	_label?: string;

	attrs:GuardValueAnotations={};
	protected constructor(pt: PrismaType) {
		this.prismaType = pt;
	}
	default<D extends GuardValue<T>>(v: DefaultValue<D>) {
		this._default = v;
		return this;
	}
	id() {
		this._id = true;
		return this;
	}
	unique() {
		this._unique = true;
		return this;
	}
	clientReadonly() {
		this._readonly = true;
		return this;
	}
	optional() {
		this._optional = true;
		return this;
	}

	label(label: string) {
		this.attrs.label = label;
		return this;
	}
	desc(description: string) {
		this.attrs.description = description;
		return this;
	}
	anotate(annotations: GuardValueAnotations) {
		this.attrs = annotations;
		return this;
	}



	parse(value: T): T {
		//TODO
		throw new Error("Todo");
		//return value;
	}

	checkDef(): string[] | null {
		const err: string[] = [];
		if (this._id && this._optional) {
			err.push("id fields cannot be optional");
		}
		this.defValidate(err);
		return err.length === 0 ? null : err;
	}
	abstract defValidate(errorlist: string[]): void;
}
