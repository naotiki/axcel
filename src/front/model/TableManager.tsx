import { Row } from "../components/Table/TableProvider";

export type CellLocation={
	row: number;
	column: number;
}

export class TableManager {
	editing?: CellLocation;
	setEditing(value?: CellLocation) {
		this.editing = value;
	}



}
class RowManager {
}