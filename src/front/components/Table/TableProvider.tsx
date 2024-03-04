import { createContext, PropsWithChildren, useContext } from "react";
import { TableManager } from "../../model/TableManager";
import { Table } from "@mantine/core";
import { ZodTypeAny } from "zod";

const TableContext = createContext<TableManager | null>(null);

//Wrapper
export function useTable() {
	const ctx = useContext(TableContext);
	if (!ctx) {
		throw new Error(
			"TableContext not found. the TableElement must be surrounded by <TableProvider>",
		);
	}
	return ctx;
}

export type Row = {
	name: string;
	type: ZodTypeAny;
};
type TableProviderProps = {
	rows: Row[];
} & PropsWithChildren;
export function TableProvider(props: TableProviderProps) {
	return (
		<TableContext.Provider value={new TableManager(props.rows)}>
			<Table striped highlightOnHover withTableBorder withColumnBorders withRowBorders stickyHeader
				layout={"fixed"}
			>
				{props.children}
			</Table>
		</TableContext.Provider>
	);
}
