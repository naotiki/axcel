
import { GuardValueAny } from "./guard";
import { GuardDateTime } from "./values/GuardDateTime";
import { GuardInt } from "./values/GuardNumbers";
import { GuardString } from "./values/GuardString";

export type DefaultValueProvider<T extends GuardValueAny> = {
    ___type?:keyof T;
    expression: string;
};


export const autoIncrement: DefaultValueProvider<GuardInt> = {
    expression: "autoincrement()",
};

export const cuid: DefaultValueProvider<GuardString> = {
    expression: "cuid()",
};

export const uuid: DefaultValueProvider<GuardString> = {
    expression: "uuid()",
};

export const now: DefaultValueProvider<GuardDateTime> = {
    expression: "now()",
};