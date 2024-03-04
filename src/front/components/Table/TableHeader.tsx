import { useTable } from "./TableProvider";
import { Table } from "@mantine/core";
export function TableHeader() {
	const ctx = useTable();
	return (
		<Table.Thead>
			<Table.Tr>
				{ctx.rows.map((r) => (
					<Table.Th key={r.name}>{r.name}</Table.Th>
				))}
			</Table.Tr>
		</Table.Thead>
	);
}
