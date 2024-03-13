import * as Y from "yjs";
import {
	GuardModel,
	GuardModelBase,
	GuardModelInput,
	GuardSchema,
	GuardModelSelector,
	GuardModelColumn,
} from "../../library/guard/GuardModel";
import { AbsoluteCellPosition } from "../components/Table/TableDevTest";

export function genSelectorId<T extends GuardModelBase>(id: GuardModelSelector<T>) {
	return (
		id.__newuuid ??
		Object.entries(id)
			.map(([k, v]) => `${k}:${v}`)
			.join("+")
	);
}
export function genCellId<T extends GuardModelBase>(location: AbsoluteCellPosition<T>) {
	return `${genSelectorId(location.id)}+${location.column ?? ""}`;
}
export type MapValueType = Y.Text | string | undefined | null;
type TableChange<T extends GuardModelBase> = {
	//row
	//_id: string;
	__id: GuardModelSelector<T>;
	column: GuardModelColumn<T>;
	new: MapValueType;
};
type TableAdd<T extends GuardModelBase> = {
	[K in keyof GuardModelInput<T>]: MapValueType;
};

export type CellChangeType = "change" | "add" | "delete";
export type RowChangeType = "add" | "delete";
export type Changes<T extends GuardModel<string, GuardSchema<string>>> = {
	deletions: GuardModelSelector<T>[];
	changes: { [key: string]: { __id: GuardModelSelector<T>; column: GuardModelColumn<T>; new: Exclude<MapValueType,Y.Text> } };
	addtions: { [key: string]: { [K in keyof GuardModelInput<T>]:  Exclude<MapValueType,Y.Text> } };
	getValue(location: AbsoluteCellPosition<T>): MapValueType;
	isChangedRow(id: GuardModelSelector<T>): RowChangeType | null;
	isChanged(location: AbsoluteCellPosition<T>): CellChangeType | null;
	hasChanges(): boolean;
};
export type MetaData = { locked?: boolean; updatedAt?: number };
export class TableChangesRepository<T extends GuardModelBase> {
	deletions: Y.Array<GuardModelSelector<T>>;
	changes: Y.Map<Y.Map<MapValueType | GuardModelSelector<T>>>;
	addtions: Y.Map<Y.Map<MapValueType>>; // UUIDのMap
	callbacks: ((changes: CellChangeType | "metaData") => void)[] = [];
	metaData: Y.Map<unknown>;
	constructor(doc: Y.Doc) {
		this.deletions = doc.getArray("deletions");
		this.changes = doc.getMap("changes");
		this.addtions = doc.getMap("addtions");
		this.metaData = doc.getMap("metaData");
		this.setMetaData("locked", false);

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

		this.metaData.observe((event) => {
			for (const cb of this.callbacks) {
				cb("metaData");
			}
		});
	}

	getMetaData(): MetaData {
		return this.metaData.toJSON() as MetaData;
	}
	setMetaData(key: keyof MetaData, value: MetaData[keyof MetaData]) {
		this.metaData.set(key, value);
	}
	removeCellChange(location: AbsoluteCellPosition<T>) {
		if (this.isChanged(location) === "change") {
			this.changes.delete(genCellId(location));
			return true;
		}
		return false;
	}
	deleteRow(id: GuardModelSelector<T>) {
		if (this.deletions.toArray().includes(id as GuardModelSelector<T>)) {
			return;
		}
		if (id.__newuuid && this.addtions.has(id.__newuuid)) {
			this.addtions.delete(id.__newuuid);
			return;
		}
		if (this.changes.has(genSelectorId(id))) {
			this.changes.delete(genSelectorId(id));
		}
		this.deletions.push([id]);
	}
	recoverRow(id: GuardModelSelector<T>) {
		const index = this.deletions.toArray().indexOf(id);
		if (index >= 0) {
			this.deletions.delete(index, 1);
		}
	}
	addChange(location: AbsoluteCellPosition<T>, change: TableChange<T>) {
		const map = new Y.Map<MapValueType | GuardModelSelector<T>>();
		map.set("column", change.column);
		map.set("new", change.new);
		map.set("__id", change.__id);

		this.changes.set(genCellId(location), map);
	}
	addAddition(id: string, addition: TableAdd<T>) {
		const map = new Y.Map<MapValueType>(Object.entries(addition));
		this.addtions.set(id, map);
	}
	addDeletion(id: GuardModelSelector<T>) {
		this.deletions.push([id]);
	}

	update(location: AbsoluteCellPosition<T>, value: MapValueType): boolean {
		const c = this.changes.get(genCellId(location));
		if (c) {
			c.set("new", value);
			return true;
		}
		if (!location.id.__newuuid) return false;
		const a = this.addtions.get(location.id.__newuuid);
		if (a) {
			a.set(location.column, value);
			return true;
		}
		return false;
	}
	//TODO: ここでエラーが出る
	getValue(location: AbsoluteCellPosition<T>): MapValueType | undefined {
		const c = this.changes.get(genCellId(location));
		if (c) {
			return c.get("new") as MapValueType;
		}
		if (location.id.__newuuid) {
			return this.addtions.get(location.id.__newuuid)?.get(location.column);
		}
	}
	isChanged(location: AbsoluteCellPosition<T>): CellChangeType | null {
		if (this.deletions.toArray().includes(location.id)) {
			return "delete";
		}
		if (this.changes.has(genCellId(location))) {
			return "change";
		}
		if (location.id.__newuuid && this.addtions.get(location.id.__newuuid)) {
			return "add";
		}
		return null;
	}
	onChanges(callback: (type: CellChangeType | "metaData") => void) {
		this.callbacks.push(callback);
	}

	getState(): Changes<T> {
		return {
			deletions: this.deletions.toArray(),
			changes: this.changes.toJSON(),
			addtions: this.addtions.toJSON(),
			getValue(location: AbsoluteCellPosition<T>): MapValueType {
				const c = this.changes[genCellId(location)];
				if (c) {
					return c.new;
				}
				return location.id.__newuuid ? this.addtions[location.id.__newuuid]?.[location.column] : undefined;
			},
			isChangedRow(id: GuardModelSelector<T>): RowChangeType | null {
				if (this.deletions.includes(id)) {
					return "delete";
				}
				if (id.__newuuid && this.addtions[id.__newuuid]) {
					return "add";
				}
				return null;
			},
			isChanged(location: AbsoluteCellPosition<T>): CellChangeType | null {
				if (this.deletions.includes(location.id)) {
					return "delete";
				}
				if (this.changes[genCellId(location)]) {
					return "change";
				}
				if (location.id.__newuuid && this.addtions[location.id.__newuuid]?.[location.column]) {
					return "add";
				}
				return null;
			},
			hasChanges() {
				return (
					this.deletions.length > 0 ||
					Object.keys(this.changes).length > 0 ||
					Object.keys(this.addtions).length > 0
				);
			},
		};
	}
}
