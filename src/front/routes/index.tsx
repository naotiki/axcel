import { Center, Container, Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Row, TableProvider } from "../components/Table/TableProvider";
import { z } from "zod";

export const Route = createFileRoute("/")({
	component: Index,
});
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
function Index() {
	return (
		<>
			<Container size="md" pt={5} />
			<Stack justify="center" align="center">
				<TableProvider rows={schemes} />
			</Stack>
		</>
	);
}
