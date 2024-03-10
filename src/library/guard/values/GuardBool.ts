import { GuardValue } from "../GuardValue";
import {PrismaType, } from "../guard";


export class GuardBool extends GuardValue<boolean> {
    validator(value: string): string[] | undefined {
        const err:string[]=[]
        const v=value.toLowerCase()
        if(v !== "true" && v !== "false") {
            err.push("trueまたはfalseである必要があります。")
            return err;
        }
    }
    constructor() {
        super(PrismaType.Boolean,false);
    }
    override defValidate(_err:string[]){
        return;
    }


}