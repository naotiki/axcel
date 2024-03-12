import * as Y from "yjs";
import { GuardModel, GuardModelColumn, GuardModelInput, GuardSchema } from "../../library/guard/GuardModel";
import { AbsoluteCellPosition } from "../components/Table/TableDevTest";

export type MapValueType = Y.Text | string | undefined | null;
type TableChange<T extends GuardModel<string, GuardSchema<string>>> = {
	//row
	//_id: string;
	//column: GuardModelColumn<T>;
	new: MapValueType;
};
type TableAdd<T extends GuardModel<string, GuardSchema<string>>> = {
	[K in keyof GuardModelInput<T>]: MapValueType;
};

export type CellChangeType = "change" | "add" | "delete";
export type RowChangeType =  "add" | "delete";
export type Changes<T extends GuardModel<string, GuardSchema<string>>> = {
	deletions: string[];
	changes: { [key: string]: { new: MapValueType } };
	addtions: { [key: string]: { [K in keyof GuardModelInput<T>]: MapValueType } };
	getValue(location: AbsoluteCellPosition<T>): MapValueType;
	isChangedRow(id:string): RowChangeType|null;
	isChanged(location: AbsoluteCellPosition<T>): CellChangeType | null;
};
export class TableChangesRepository<T extends GuardModel<string, GuardSchema<string>>> {
	deletions: Y.Array<string>;
	changes: Y.Map<Y.Map<MapValueType>>;
	addtions: Y.Map<Y.Map<MapValueType>>; // UUIDのMap
	callbacks: ((changes: CellChangeType) => void)[] = [];

	constructor(doc: Y.Doc) {
		this.deletions = doc.getArray("deletions");
		this.changes = doc.getMap("changes");
		this.addtions = doc.getMap("addtions");
		this.deletions.observeDeep((event) => {
			for (const cb of this.callbacks) {
				cb("delete");
			}
		});
		this.changes.observeDeep((event) => {
			for (const cb of this.callbacks) {
				cb("change");
			}
		});
		this.addtions.observeDeep((event) => {
			for (const cb of this.callbacks) {
				cb("add");
			}
		});
	}
	private genCellId(location: AbsoluteCellPosition<T>) {
		return `${location.id}+${location.column ?? ""}`;
	}
	removeCellChange(location: AbsoluteCellPosition<T>) {
		//if(this.isChanged(location) === "delete"){
		if (this.isChanged(location) === "change") {
			this.changes.delete(this.genCellId(location));
			return true;
		}
		return false;
	}
	deleteRow(id: string) {
		if (this.deletions.toArray().includes(id)) {
			return;
		}
		if (this.addtions.has(id)) {
			this.addtions.delete(id);
			return;
		}
		if (this.changes.has(id)) {
			this.changes.delete(id);
		}
		this.deletions.push([id]);
	}
	recoverRow(id: string) {
		const index = this.deletions.toArray().indexOf(id);
		if (index >= 0) {
			this.deletions.delete(index, 1);
		}
	}
	addChange(location: AbsoluteCellPosition<T>, change: TableChange<T>) {
		const map = new Y.Map<MapValueType>();
		map.set("new", change.new);
		this.changes.set(this.genCellId(location), map);
	}
	addAddition(id: string, addition: TableAdd<T>) {
		const map = new Y.Map<MapValueType>(Object.entries(addition));
		this.addtions.set(id, map);
	}
	addDeletion(id: string) {
		this.deletions.push([id]);
	}

	update(location: AbsoluteCellPosition<T>, value: MapValueType): boolean {
		const c = this.changes.get(this.genCellId(location));
		if (c) {
			c.set("new", value);
			return true;
		}
		const a = this.addtions.get(location.id);
		if (a) {
			a.set(location.column, value);
			return true;
		}
		return false;
	}
	//TODO: ここでエラーが出る
	getValue(location: AbsoluteCellPosition<T>): MapValueType {
		const c = this.changes.get(this.genCellId(location));
		if (c) {
			return c.get("new");
		}
		return this.addtions.get(location.id)?.get(location.column);
	}
	isChanged(location: AbsoluteCellPosition<T>): CellChangeType | null {
		if (this.deletions.toArray().includes(location.id)) {
			return "delete";
		}
		if (this.changes.has(`${location.id}+${location.column ?? ""}`)) {
			return "change";
		}
		if (this.addtions.get(location.id)) {
			return "add";
		}
		return null;
	}
	onChanges(callback: (type: CellChangeType) => void) {
		this.callbacks.push(callback);
	}

	getState(): Changes<T> {
		return {
			deletions: this.deletions.toArray(),
			changes: this.changes.toJSON(),
			addtions: this.addtions.toJSON(),
			getValue(location: AbsoluteCellPosition<T>): MapValueType {
				const c = this.changes[`${location.id}+${location.column ?? ""}`];
				if (c) {
					return c.new;
				}
				return this.addtions[location.id]?.[location.column];
			},
			isChangedRow(id:string): RowChangeType|null{
				if (this.deletions.includes(id)) {
					return "delete";
				}
				if (this.addtions[id]) {
					return "add";
				}
				return null;
			},
			isChanged(location: AbsoluteCellPosition<T>): CellChangeType | null {
				if (this.deletions.includes(location.id)) {
					return "delete";
				}
				if (this.changes[`${location.id}+${location.column ?? ""}`]) {
					return "change";
				}
				if (this.addtions[location.id]?.[location.column]) {
					return "add";
				}
				return null;
			},
		};
	}
}
