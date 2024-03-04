import { Row } from "../components/Table/TableProvider";

export class TableManager {
	rows: Row[];
	constructor(rows: Row[]) {
		this.rows = rows;
	}

	setEditing(value: boolean) {}
}
