import { any, z } from "zod";
import { DefaultValue, PrismaType } from "./guard";
import { WithAttributes } from "./WithAttributes";

export type GuardValueAnotations = {
	label?: string;
	description?: string;
};

export abstract class GuardValue<T> extends WithAttributes {
	prismaType: PrismaType;
	_default?: DefaultValue<GuardValue<T>>;
	_typeLabel: string ;
	_id?: boolean;
	_unique?: boolean;
	_readonly?: boolean;
	_optional?: boolean;
	_isFreeEdit:boolean;
	protected constructor(label:string, pt: PrismaType,freeEdit:boolean) {
		super();
		this._typeLabel = label;
		this.prismaType = pt;
		this._isFreeEdit = freeEdit;
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
	axcelReadonly() {
		this._readonly = true;
		return this;
	}
	optional() {
		this._optional = true;
		return this as this & GuardOptional;
	}


	validate(value: string|undefined|null): string[] | undefined {
		//TODO
		if (value===undefined) {
			return this._default ? undefined : ["デフォルト値が設定されていません"];
		}
		if(value===null){
			return this._optional ? undefined : ["空の値は許可されていません"];
		}
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
