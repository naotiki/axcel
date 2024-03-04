import { GuardValue } from "../GuardValue";
import {PrismaType, } from "../guard";


export class GuardBool extends GuardValue<boolean> {
    constructor() {
        super(PrismaType.Boolean);
    }
    override defValidate(_err:string[]){
        return;
    }
}