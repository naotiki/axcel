import { Card, Container, Title, Text, Stack, Group, rem, Center, Box } from "@mantine/core";
import { Link, createFileRoute } from "@tanstack/react-router";
import a from "../../TableDevTest";
import { GuardModelBase } from "@/library/guard/GuardModel";
import { RouteAnchor } from "../components/RouteAnchor";
import { IconArrowRight, IconHome } from "@tabler/icons-react";
import { useHover } from "@mantine/hooks";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<>
			<Container size={"sm"}>
				<Group gap={2} align="center">
					<IconHome style={{ width: rem(40), height: rem(40) }} />
					<Title order={1}>ホーム</Title>
				</Group>
				<Stack my={50}>
					{a.models.map((model) => (
						<ModelCard key={model.name} model={model} />
					))}
				</Stack>
			</Container>
		</>
	);
}

function ModelCard({ model }: { model: GuardModelBase }) {
	const { ref, hovered } = useHover();
	return (
		<>
			<RouteAnchor to="/model/$name" params={{ name: model.name }} underline="never">
				<Card shadow={hovered ? "lg" : "sm"} padding="lg" radius="md" withBorder ref={ref}>
					<Group justify="space-between">
						<Box>
							<Title order={1}>{model.dispName()}</Title>
							<Text>{model.attrs.description ?? ""}</Text>
							
						</Box>
						{hovered && <IconArrowRight />}
					</Group>
				</Card>
			</RouteAnchor>
		</>
	);
}
