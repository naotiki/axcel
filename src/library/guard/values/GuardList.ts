import { GuardValue } from "../GuardValue";
import {  PrismaType } from "../guard";

export class GuardList<T extends GuardValue<E>,E> extends GuardValue<E[]>{
    value:T;
    validator(value: string): string[] | undefined {
        return this.value.validator(value);
    }
    
    constructor(value:T){
        super(`${value._typeLabel}のリスト`,PrismaType.List,false);
        this.value = value;
    }
    override defValidate(errorlist: string[]): void {
      this.value.defValidate(errorlist);
    }
}