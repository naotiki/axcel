import { GuardValue } from "../GuardValue";
import {PrismaType} from "../guard";


export class GuardDateTime extends GuardValue<Date> {
    _updatedAt?:boolean;
    isDateOnly?:boolean;
    constructor() {
        super(PrismaType.DateTime);
    }
    dateOnly(){
        this.isDateOnly = true;
        return this;
    }
    updatedAt(){
        this._updatedAt = true;
        return this;
    }
    override defValidate(_err:string[]) {
        return;
    }
}