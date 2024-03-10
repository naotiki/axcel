import { any, z } from "zod";
import { DefaultValue, PrismaType } from "./guard";

export type GuardValueAnotations = {
	label?: string;
	description?: string;
};

export abstract class GuardValue<T> {
	prismaType: PrismaType;
	_default?: DefaultValue<GuardValue<T>>;
	_id?: boolean;
	_unique?: boolean;
	_readonly?: boolean;
	_optional?: boolean;
	attrs: GuardValueAnotations = {};
	protected constructor(pt: PrismaType) {
		this.prismaType = pt;
	}
	default<D extends GuardValue<T>>(v: DefaultValue<D>) {
		this._default = v;
		return this as this & GuardHasDefault<T>;
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
		return this as this & GuardOptional;
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

	validate(value: string): string[] | undefined {
		//TODO
		const err = this.validator(value);
		return err;
		//return value;
	}
	abstract validator(value:string):string[] | undefined;

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

export type GuardOptional = { _optional: true };
export type GuardHasDefault<T> = { _default:  DefaultValue<GuardValue<T>> };
