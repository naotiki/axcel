import { Center, Container, Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { Row, TableProvider } from "../components/Table/TableProvider";
import { mockDatas, mockModel } from "../components/Table/TableDevTest";

export const Route = createFileRoute("/")({
	component: Index,
});
function Index() {
	return (
		<>
			<Container size="md" pt={5} />
			<Stack justify="center" align="center">
				<TableProvider model={mockModel}  />
			</Stack>
		</>
	);
}
