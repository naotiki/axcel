import {Container, Table} from "@mantine/core";
import { useEffect } from "react";
import { z } from "zod";
import {Row, TableProvider} from "../components/Table/TableProvider";
import {TableHeader} from "../components/Table/TableHeader";
import {CellText} from "../components/Table/CellText";

const schemes: Row[] = [
	{
		name: "id",
		type: z.number().int().positive().readonly(),
	},
	{
		name: "title",
		type: z.nullable(z.string()),
	},
	{
		name: "category",
		type: z.enum(["aaaaa"]),
	},
	{
		name: "createdAt",
		type: z.string().datetime().readonly(),
	},
	{
		name: "updatedAt",
		type: z.string().datetime().readonly(),
	},
];
export function Top() {
	useEffect(() => {}, []);
	return (
		<Container size="md" pt={5}>
			<TableProvider rows={schemes}>
				<TableHeader/>
				<Table.Tbody>
					<Table.Tr>
						<Table.Td>
							a
						</Table.Td>
						<CellText zod={z.string()} />
						<CellText zod={z.string()} />
						<CellText zod={z.string()} />
						<CellText zod={z.string().email()} />
					</Table.Tr>
				</Table.Tbody>
			</TableProvider>
		</Container>
	);
}
