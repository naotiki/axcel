import * as Y from "yjs";
import { GuardModel, GuardModelColumn, GuardModelInput, GuardSchema } from "../../library/guard/GuardModel";
import { AbsoluteCellPosition } from "../components/Table/TableDevTest";

type TableChange<T extends GuardModel<string, GuardSchema<string>>> = {
	//row
	//_id: string;
	//column: GuardModelColumn<T>;
	new: Y.Text;
};
type TableAdd<T extends GuardModel<string, GuardSchema<string>>> = {
	[K in keyof GuardModelInput<T>]: Y.Text;
};

type TableChangeEventType = "change" | "add" | "delete";

export type Changes<T extends GuardModel<string, GuardSchema<string>>> = {
	deletions: string[];
	changes: { [key: string]: { new: Y.Text }} ;
	addtions: { [key: string]: { [K in keyof GuardModelInput<T>]: Y.Text }};
	getYTextOrNull(location: AbsoluteCellPosition<T>): Y.Text | null;
};

export class TableChangesRepository<T extends GuardModel<string, GuardSchema<string>>>  {
	deletions: Y.Array<string>;
	changes: Y.Map<Y.Map<Y.Text>>;
	addtions: Y.Map<Y.Map<Y.Text>>;
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
	addChange(location: AbsoluteCellPosition<T>, change: TableChange<T>) {
		const map = new Y.Map<Y.Text>();
		map.set("new", change.new);
		this.changes.set(this.genCellId(location), map);
	}
	addAddition(id: string, addition: TableAdd<T>) {
		const map = new Y.Map<Y.Text>(Object.entries(addition.data));
		this.addtions.set(id, map);
	}
	addDeletion(id: string) {
		this.deletions.push([id]);
	}

	getYTextOrNull(location: AbsoluteCellPosition<T>): Y.Text | null {
		return (
			this.changes.get(this.genCellId(location))?.get("new") ??
			this.addtions.get(location.id)?.get(location.column) ?? null
		);
	}

	onChanges(callback: (type: TableChangeEventType) => void) {
		this.callbacks.push(callback);
	}

  getState() :Changes<T>{
    return {
      deletions: this.deletions.toArray(),
      changes: this.changes.toJSON(),
      addtions: this.addtions.toJSON(),
      getYTextOrNull(location: AbsoluteCellPosition<T>): Y.Text | null {
        return (
          this.changes[`${location.id}+${location.column ?? ""}`]?.new ??
          this.addtions[location.id]?.[location.column]
        );
      }
    }
  }

}
