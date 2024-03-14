import { Container, Stack, Text, Title } from "@mantine/core";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { TableProvider } from "../components/Table/TableProvider";
import a from "../components/Table/TableDevTest";

export const Route = createFileRoute("/model/$name")({
	loader: ({ params: { name } }: { params: { name: string } }) => {
		console.log("modelName", name);
		const model = a.models.find((m) => m.name === name);
		if (!model) throw notFound();
		console.dir(model);
		return { model };
	},
	component: Model,
});

function Model() {
	const { model } = Route.useLoaderData();
	if (!model) {
		return <></>;
	}
	return (
		<Container size={"md"}>
			<Title order={1}>{model.dispName()}</Title>
			<Text>{model.attrs.description??""}</Text>
			<Stack justify="center" align="center">
				<TableProvider model={model} />
			</Stack>
		</Container>
	);
}
