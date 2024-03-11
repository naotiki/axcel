import * as Y from "yjs";
import { GuardModel, GuardModelColumn, GuardModelInput, GuardSchema } from "../../library/guard/GuardModel";
import { AbsoluteCellPosition } from "../components/Table/TableDevTest";

type TableChange<T extends GuardModel<string, GuardSchema<string>>> = {
	//row
	//_id: string;
	//column: GuardModelColumn<T>;
	new: Y.Text | string | undefined;
};
type TableAdd<T extends GuardModel<string, GuardSchema<string>>> = {
	[K in keyof GuardModelInput<T>]: Y.Text | string;
};

export type TableChangeEventType = "change" | "add" | "delete";

export type Changes<T extends GuardModel<string, GuardSchema<string>>> = {
	deletions: string[];
	changes: { [key: string]: { new: Y.Text | string } };
	addtions: { [key: string]: { [K in keyof GuardModelInput<T>]: Y.Text | string } };
	getYTextOrNull(location: AbsoluteCellPosition<T>): Y.Text | null;
	isChanged(location: AbsoluteCellPosition<T>): TableChangeEventType | null;
};
type MapValueType = Y.Text | string | undefined;
export class TableChangesRepository<T extends GuardModel<string, GuardSchema<string>>> {
	deletions: Y.Array<string>;
	changes: Y.Map<Y.Map<MapValueType>>;
	addtions: Y.Map<Y.Map<MapValueType>>; // UUIDのMap
	callbacks: ((changes: TableChangeEventType) => void)[] = [];

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
	addChange(location: AbsoluteCellPosition<T>, change: TableChange<T>) {
		const map = new Y.Map<MapValueType>();
		map.set("new", change.new);
		this.changes.set(this.genCellId(location), map);
	}
	addAddition(id: string, addition: TableAdd<T>) {
		const map = new Y.Map<MapValueType>(Object.entries(addition.data));
		this.addtions.set(id, map);
	}
	addDeletion(id: string) {
		this.deletions.push([id]);
	}

	update(location: AbsoluteCellPosition<T>, value: string | undefined) {
		return (
			this.changes.get(this.genCellId(location))?.set("new", value) ??
			this.addtions.get(location.id)?.set(location.column, value) ??
			null
		);
	}
//TODO: ここでエラーが出る
	getYTextOrNull(location: AbsoluteCellPosition<T>): Y.Text | null {
		return (
			this.changes.get(this.genCellId(location))?.get("new") ??
			this.addtions.get(location.id)?.get(location.column) ??
			null
		);
	}
	isChanged(location: AbsoluteCellPosition<T>): TableChangeEventType | null {
		if (this.deletions.toArray().includes(location.id)) {
			return "delete";
		}
		if (this.changes.has(`${location.id}+${location.column ?? ""}`)) {
			return "change";
		}
		if (this.addtions.get(location.id)?.has(location.column)) {
			return "add";
		}
		return null;
	}
	onChanges(callback: (type: TableChangeEventType) => void) {
		this.callbacks.push(callback);
	}

	getState(): Changes<T> {
		return {
			deletions: this.deletions.toArray(),
			changes: this.changes.toJSON(),
			addtions: this.addtions.toJSON(),
			getYTextOrNull(location: AbsoluteCellPosition<T>): Y.Text | null {
				return (
					this.changes[`${location.id}+${location.column ?? ""}`]?.new ??
					this.addtions[location.id]?.[location.column]
				);
			},
			isChanged(location: AbsoluteCellPosition<T>): TableChangeEventType | null {
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
