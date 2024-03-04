import { GuardValue } from "../GuardValue";
import {  PrismaType } from "../guard";

export class GuardList<T extends GuardValue<E>,E> extends GuardValue<E[]>{
    
    value:T;
    constructor(value:T){
        super(PrismaType.List);
        this.value = value;
    }
    override defValidate(errorlist: string[]): void {
      
    }
}