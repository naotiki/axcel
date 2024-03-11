import { Card, Container, Title, Text, Stack } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home")({
	component: Home,
});

function Home() {
	return (
		<>
			<Container size={"md"}>
				<Title order={1}>ホーム</Title>
				<Stack>
					<ModelCard />
					<ModelCard />
					<ModelCard />
				</Stack>
			</Container>
		</>
	);
}

function ModelCard() {
	return (
		<>
			<Card shadow="sm">
				<Title order={3}>ムービー</Title>
        
			</Card>
		</>
	);
}
